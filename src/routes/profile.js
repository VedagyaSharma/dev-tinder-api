const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData, validateNewPassword  } = require('../utils/validation')
const { User } = require("../models/user");
const bcrypt = require('bcrypt');

const profileRouter = express.Router();

// cookie use api 
profileRouter.get("/profile/view", userAuth, async (req, res) => { // next() in userAuth(user attached) will run this (req, res) => {}

    try {
        const loggedInUser = req.user;
        res.send("real cookie user -- " + loggedInUser);
    } catch (error) {
        res.status(400).send("ERROR -- ", error.message);
    }

});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateEditProfileData(req)) {
            throw new Error ("invalid edit request");
        }
        const loggedInUser = req.user; // from userAuth
        console.log(loggedInUser);

        //  again DB lookup (pattern breaker)
        // const updatedUser = await User.findByIdAndUpdate(
        //     loggedInUser._id,
        //     updates,
        //     {
        //         new: true,           // return updated doc
        //         runValidators: true  // run schema validation
        //     }
        // );

        Object.keys(req.body).forEach(key => {
            loggedInUser[key] = req.body[key];
        });
        
        await loggedInUser.save(); // updating current user (like here)
        
        res.json({message: "profile updated successfully", data: loggedInUser});
    } catch (error) {
        res.status(400).send("ERROR -- " + error.message);
    }
});

profileRouter.patch('/profile/change_password', userAuth, async (req, res) => {
    try {
        if(!validateNewPassword(req)) {
            throw new Error ("invalid password change request");
        }

        const loggedInUser = req.user; // from userAuth
        const loggedInUserNewPassword = req.body.password;
        
        const hashedNewPassword = await bcrypt.hash(loggedInUserNewPassword, 10);
        
        const isSame = await bcrypt.compare(loggedInUserNewPassword, loggedInUser.password);
        if (isSame) {
            throw new Error("New password cannot be same as old password");
        }
        // console.log("HASHED NEW PW -- ", hashedNewPassword);
        loggedInUser.password = hashedNewPassword;
        await req.user.save();

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        res.status(400).send("ERROR -- " + error.message);
    }
})

module.exports = { profileRouter }