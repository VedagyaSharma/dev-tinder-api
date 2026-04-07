const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { ConnectionRequest } = require('../models/connectionRequest');
// const { User } = require('../models/user');

// get all the PENDING connection requests for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            // the one logged in will only see whats up
            toUserId: loggedInUser._id,
            // status: "interested"
        }).populate("fromUserId", ["firstName", "lastName", "age", "photoUrl"]);

        res.json({
            message: "data feched successfully",
            data: connectionRequests
        });

    } catch (error) {
        res.status(400).send("ERROR - " + error.message);
    }
});

// get all ACCEPTED connections by both users (sender + receiver)
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        
        const loggedInUser = req.user;
        // akshay -> elon -> accepted, and elon can also to some etc

        // either one -- accepted === exists. just like sending/swipe it
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {
                    toUserId: loggedInUser._id, status: "accepted"
                },
                {
                    fromUserId: loggedInUser._id, status: "accepted"
                }
            ]
            // fromUserId alone will cause bug as toUserID is also valid
        }).populate("fromUserId", ["firstName", "lastName", "age", "photoUrl"])
            .populate("toUserId", ["firstName", "lastName", "age", "photoUrl"]);

        // project data
        const data = connectionRequests.map(row => {
            // id comparision using toString() or toequals()
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId
        });

        res.json({message: "data fetched", data: data});

    } catch (error) {
        res.status(400).send("ERROR - " + error.message);
    }
});

module.exports = { userRouter }