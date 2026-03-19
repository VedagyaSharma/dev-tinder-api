const express = require('express');
const { userAuth } = require('../middlewares/auth')

const profileRouter = express.Router();

// cookie use api 
profileRouter.get("/profile", userAuth, async (req, res) => { // next() in userAuth(user attached) will run this (req, res) => {}

    try {
        const user = req.user;
        res.send("real cookie user -- " + user);
    } catch (error) {
        res.status(400).send("ERROR -- ", error.message);
    }

});


module.exports = { profileRouter }