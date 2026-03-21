const express = require('express');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validateSingupData } = require('../utils/validation');
const cookieParser = require('cookie-parser');
const { generateTokens } = require('../utils/token');
const redis = require('../config/redis');
const { loginLimiter } = require('../middlewares/rateLimiter');

const authRouter = express.Router();

/*
    🔑 Session Strategy:
    refresh:${userId}:${jti}

    Store in Redis:
    key: refresh:<jti>
    value: userId
    expiry: 7 days
    -> other keys
    user:<id>
    session:<id>
*/
// NO TTL / EX leaks memory
/*
    🔑 JTI (Token ID)
    refreshToken → contains jti
    Redis → stores active sessions

    🔄 Token Lifecycle
    Login → create RT → store in Redis
    Refresh → rotate RT
    Logout → delete RT
*/

authRouter.post("/signup", async (req, res) => {
    try {
        // validation of data from req.body
        validateSingupData(req);

        // encrypt pw and then store in db
        const { password, firstName, lastName, emailId, age } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        const saltRounds = 10; // 10 to 12
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // console.log(hashedPassword);

        // creating a new instance of user model (always in signup only)
        const user = new User({
            firstName, lastName, emailId, password: hashedPassword, age
        }); // req.body can be corrupted

        await user.save();

        // auto-login after signup
        const { accessToken, refreshToken, jti } = generateTokens(user);

        // create session using refresh token in redis for session control
        await redis.set(
            `refresh:${user._id}:${jti}`,
            "valid",
            "EX",
            7 * 24 * 60 * 60
        );

        // send tokens via secure cookies
        res
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            })
            .status(201)
            .json({
                message: "signup successful",
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    emailId: user.emailId
                }
            });

    } catch (error) {
        res.status(500).json({
            error: "Signup Failed"
        });
    }
});

authRouter.post('/login', loginLimiter, async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).send("email and password required");
        }

        const user = await User.findOne({ emailId }).select("+password");

        if (!user) {
            return res.status(401).send("invalid credentials");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).send("invalid credentials");
        }

        // generate tokens
        const { accessToken, refreshToken, jti } = generateTokens(user);

        // decoded.jti = unique ID of the old refresh token
        // Redis key: refresh:<jti></jti>

        // store refresh token in redis (7 days) - create session
        await redis.set(
            `refresh:${user._id}:${jti}`,
            "valid",
            "EX",
            7 * 24 * 60 * 60
        );

        // send cookies
        res
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            })
            .status(200)
            .json({
                success: true,
                message: "login successful"
            });

    } catch (error) {
        res.status(500).send("login failed");
    }
});

authRouter.post("/logout", async (req, res) => {
    try {
        // get refresh token from cookie
        const { refreshToken } = req.cookies;

        // decode it
        if (refreshToken) {
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
            // delete from redis
            await redis.del(`refresh:${decoded._id}:${decoded.jti}`);
        }

        // clear cookies
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .send("logged out successfully");

    } catch (error) {
        // if error still clear cookies - security
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .send("logged out");
    }
})

authRouter.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ error: "no refresh token" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
        console.log("DECODED -- ", decoded);

        // check if session exists
        const stored = await redis.get(`refresh:${decoded._id}:${decoded.jti}`);

        if (!stored) {
            return res.status(403).send("invalid session");
        }

        // rotation - rotate session using RT
        // 1. invalidate old refresh token by its id decoded.jti
        await redis.del(`refresh:${decoded._id}:${decoded.jti}`);

        // 2. extract user info and prepare payload for new tokens
        const user = { _id: decoded._id };

        // 3. generate new tokens
        // Take refreshToken from the object, but store it in a variable called newRT
        const { accessToken, refreshToken: newRT, jti } = generateTokens(user);
        /*
            const tokens = generateTokens(user);

            const accessToken = tokens.accessToken;
            const newRT = tokens.refreshToken; // renamed here
            const jti = tokens.jti;
        */
        // store the redis with new token pair
        await redis.set(
            `refresh:${user._id}:${jti}`,
            "valid",
            "EX",
            7 * 24 * 60 * 60
        );

        res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict" })
            .cookie("refreshToken", newRT, { httpOnly: true, secure: true, sameSite: "strict" })
            .send("Refreshed")
    } catch (error) {
        res.status(403).json({ error: "Refresh failed" });
    }
});

module.exports = { authRouter };
