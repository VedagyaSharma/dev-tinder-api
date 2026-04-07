const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { ConnectionRequest } = require('../models/connectionRequest');
// const { User } = require('../models/user');

// get all the PENDING connection requests for the loggedIn user
userRouter.get("/user/requests", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        // console.log(loggedInUser.firstName);

        // If loggedInUser._id is string sometimes → aggregation fails silently.
        const userId = new mongoose.Types.ObjectId(loggedInUser._id);

        // $match → $sort → $skip → $limit → $lookup -> $unwind
        const allRequests = await ConnectionRequest.aggregate([
            {
                $match: {
                    toUserId: userId, // WHERE toUserId = loggedInUser._id w validation
                    // status: "interested"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "fromUserId",
                    foreignField: "_id",
                    as: "fromUser"
                }
            },
            {
                $unwind: {
                    path: "$fromUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    createdAt: 1,
                    fromUser: {
                        _id: "$fromUser._id",
                        firstName: "$fromUser.firstName",
                        lastName: "$fromUser.lastName",
                        photoUrl: "$fromUser.photoUrl"
                    }
                }
            },
            {
                $sort: { createdAt: -1 } // latest first
            }
        ]);

        console.log(allRequests);

        return res.status(200).json({ data: allRequests });
    } catch (error) {
        res.status(400).send("ERROR - " + error.message);
    }
});

module.exports = { userRouter }
