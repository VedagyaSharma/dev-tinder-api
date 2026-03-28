const express = require('express');
const { userAuth } = require('../middlewares/auth')
const requestsRouter = express.Router();
const { ConnectionRequest } = require('../models/connectionRequest');
const { User } = require('../models/user');

requestsRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    // sending a connection request - interested and ignore dynamically via :status
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        // console.log(fromUserId, toUserId, status);

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "invalid status type " + status
            })
        }

        // prevent self request -- handled in presave also in schema
        if(fromUserId.toString() === toUserId.toString()) {
            return res.status(400).json({message: "cannot send request to yourself"})
        }

        // check user exist
        const toUser = await User.findById(toUserId);
        if(!toUser) {
            return res.status(404).json({message: "user not found "})
        }

        // if there is an existing ConnectionRequest + Other has already sent us too
        // Check if any connection already exists between these two users, regardless of who sent it
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {
                    fromUserId, toUserId
                },
                {
                    fromUserId: toUserId, toUserId: fromUserId
                }
            ]
        });

        if(existingConnectionRequest) {
            return res.status(400).json({
                message: "Connection request already exists"
            })
        }

        // Upgrade 1: Replace “check + create/save” with ATOMIC operation
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();
        res.status(201).json({
            message: "connection reqauest sent successfully",
            data
        });

        /*
            if (status === "interested" && reverseRequest) {
            🎉 MATCH
            }
        */
    } catch (error) {
        res.status(400).send("ERROR " + error.message)
    }
});

module.exports = { requestsRouter }

/*
    Follow system (Instagram)	✅ Yes	only { from → to }
    Friend request	            ❌ No	$or both ways
*/