const express = require('express');
const requestsRouter = express.Router();
const { userAuth } = require('../middlewares/auth')
const { ConnectionRequest } = require('../models/connectionRequest');
const { User } = require('../models/user');

requestsRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    // console.log("request send api hit");
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
            });
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
        // Check if any connection request already exists between these two users, regardless of who sent it
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
        console.log(" saving connection ")

        res.status(201).json({
            message: "connection reqauest sent successfully",
            data
        });
        /*
        🔥 THIS LINE GOES HERE
            const [user1, user2] = [fromUserId.toString(), toUserId.toString()].sort();
            
            const connectionRequest = await ConnectionRequest.findOneAndUpdate(
            {
                fromUserId,
                toUserId
            },
            {
                $setOnInsert: {
                    fromUserId,
                    toUserId,
                    status
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        res.status(201).json({
            message: "connection request sent successfully",
            data: connectionRequest
        });
        */

        /*
            if (status === "interested" && reverseRequest) {
            🎉 MATCH
            }
        */
    } catch (error) {
        res.status(400).send("ERROR " + error.message)
    }
});

requestsRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "invalid status type " + status
            });
        }
        // vedTest3 sent to vedTest2
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });

        if( !connectionRequest ) {
            return res.status(404).json({message: "connection not found"});
        }

        connectionRequest.status = status; // from params

        const data = await connectionRequest.save();
        
        res.json({mesaage: "connection request " + status + data});

        // ved => other (now logged in user is other as they will review)
        // status (review is only possible after intersted status)
        // loggedInUser === toUserId and requestId is validated

    } catch (error) {
        res.status(400).send("ERROR -- " + error.message);
    }

});

module.exports = { requestsRouter }

/*
    Follow system (Instagram)	✅ Yes	only { from → to }
    Friend request	            ❌ No	$or both ways
*/