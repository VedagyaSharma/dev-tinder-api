const express = require('express');
const app = express();
const { User } = require("../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { validateSingupData } = require('../utils/validation');

app.use(cookieParser());


const authRouter = express.Router();

    // signup
authRouter.post("/signup", async (req, res) => {
    console.log(req.body); // from raw postman
    
    // await User.create(req.body);
        // const userObj = {
        //     firstName: "Ronaldo",
        //     lastName: "McCullum",
        //     emailId: "rm@sharma.com",
        //     password: "rm@123",
        //     age: 26
        // }
    
        try {
            // validation of data from req.body
            validateSingupData(req);
    
            // encrypt pw and then store in db
            const {password, firstName, lastName, emailId, age} = req.body;
            const saltRounds = 10; // 10 to 12
            const passwordHash = await bcrypt.hash(password, saltRounds); 
            console.log(passwordHash);
    
            // creating a new instance of user model 
            const user = new User({
                firstName, lastName, emailId, password: passwordHash, age
            }); // req.body can be corrupted
    
            await user.save();
            res.status(201).json("user inserted successfully")
        } catch (error) {
            res.status(400).json("error saving user data : " + error.message);
        }
    });

    // login
authRouter.post("/login", async (req, res) => {
    try {
        // validateSingupData(req); -> will check everything
        // console.log(req.body.emailId);
        const {emailId, password} = req.body;
        
        if(!emailId || !password) {
            return res.status(400).send("email and password required");
        }

        const user = await User.findOne({ emailId }).select("+password");
        // console.log("login user mail find -- ", user);
        if(!user) {
            throw new Error ("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValidFromMethod = await user.validatePassword(password);

        if(isPasswordValid) {

            // Create a JWT Access Token
            const tokenFromMethod = await user.getJWT();
            // hiding userId under this token
            const token = jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
                expiresIn: "3d" });
            console.log(token);

            // Refresh Token??

            // Add the token to cookie and send the response back to user
            res.cookie("token", token, { httpOnly: true, secure: true, expires: 
                new Date(Date.now() + 72 * 3600000) // expires in 8 hours
            }); // secure: true, sameSite: "stict"

            res.status(200).json({ message: "Login successful" });
        }
        else {
            throw new Error("Password or email incorrect")
        }

    } catch (error) {
        res.status(400).send("ERROR " + error.message);
    }
});

    // logout
authRouter.post("/logout", async (req, res) => {
    try {
        // remove the cookie token / nullify and expire immedital
        res.cookie("token", null, {
            expires: new Date(Date.now()) // remove JTI and redis session store
        });

        res.status(200).send("user logged out successfully")
    } catch (error) {
        res.status(401).send("ERROR -- " + error.message);
    }
});


module.exports = { authRouter }