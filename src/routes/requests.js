const express = require('express');
const { userAuth } = require('../middlewares/auth')

const requestsRouter = express.Router();

requestsRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
        const user = req.user;
        // sending a connection request
        res.send(user.firstName + " sent a connection request");
    } catch (error) {
        
    }
});

module.exports = { requestsRouter }
