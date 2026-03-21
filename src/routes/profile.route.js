const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData, validateNewPassword } = require('../utils/validation')
const { User } = require("../models/user");
const bcrypt = require('bcrypt');
const redis = require('../config/redis');

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // → explicitly pick safe fields (response shaping)
        const safeUser = {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            emailId: loggedInUser.emailId,
            photoUrl: loggedInUser.photoUrl,
            age: loggedInUser.age,
            gender: loggedInUser.gender,
            about: loggedInUser.about,
            skills: loggedInUser.skills,
        };

        res.status(200).json({
            success: true,
            data: safeUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: "failed to fetch profile"
        });
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        validateEditProfileData(req);

        const loggedInUser = req.user;

        // prevent empty update (it'll be wasteful DB call)
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: "No data provided for update"
            });
        }

        // ensuring only intended fields are updated controlled
        Object.keys(req.body).forEach((key) => {
            if (typeof req.body[key] === "string") { // trimming values to editable fields
                loggedInUser[key] = req.body[key].trim();
            } else {
                loggedInUser[key] = req.body[key];
            }
        });

        // Save triggers mongoose validation + hooks
        await loggedInUser.save();

        const safeUser = {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            emailId: loggedInUser.emailId,
            photoUrl: loggedInUser.photoUrl,
            age: loggedInUser.age,
            gender: loggedInUser.gender,
            about: loggedInUser.about,
            skills: loggedInUser.skills,
        };

        res.status(200).json({
            success: true,
            message: "profile updated successfully",
            data: safeUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || "update failed"
        });
    }
});

profileRouter.patch("/profile/change_password", userAuth, async (req, res) => {
    // Password changed → ALL sessions invalidated → user forced to re-login
    try {
        validateNewPassword(req);

        const loggedInUser = req.user; // present in db
        const newPassword = req.body.password; // client via

        // prevent password resue
        const isSame = await bcrypt.compare(newPassword, loggedInUser.password);

        if (isSame) {
            return res.status(400).json({
                success: false,
                error: "New password cannot be same as old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // update pw
        loggedInUser.password = hashedPassword;
        // save to trigger validations and hooks
        await loggedInUser.save();

        // invalidate ALL sessions -> delete all refresh tokens from redis
        const pattern = `refresh:${loggedInUser._id}:*`;

        const keys = await redis.keys(pattern); // use SCAN in prod

        if (keys.length > 0) {
            await redis.del(keys);
        }

        // clear cookies -> force re-login
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .status(200)
            .json({
            success: true,
            message: "Password changed successfully, login again.",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || "Password change failed",
        });
    }
});

module.exports = { profileRouter };
