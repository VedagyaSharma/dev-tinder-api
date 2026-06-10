const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { ConnectionRequest } = require('../models/connectionRequest');
const { User } = require('../models/user');
// const { User } = require('../models/user');

/*
    populate() is from Mongoose (application level)

    $lookup is from MongoDB (database level)

    SELECT cr._id, cr.status, u.firstName, u.lastName, u.age, u.photoUrl
    FROM ConnectionRequest cr
    JOIN User u ON cr.fromUserId = u._id
    WHERE cr.toUserId = ?;
*/

// request sent == [interested, ignored]
// request review == [accepted, rejected]

// get all the PENDING connection requests for the loggedIn user (someone swiped the user means they were interested)
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            // the one logged in will only see - if Akshay is logged in, fetch rows where toUserId = Akshay._id.
            toUserId: loggedInUser._id,
            // with populate Mongoose replaces fromUserId ObjectId with the actual user document fields you asked for
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
        // akshay -> elon -> accepted, and elon can also to someone etc

        // either one -- accepted === exists. just like sending/swipe it (to || from)
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {
                    toUserId: loggedInUser._id, status: "accepted"
                },
                {
                    fromUserId: loggedInUser._id, status: "accepted"
                }
            ]
            // if we search only fromUserId, we miss the cases where someone else sent the request to us
        }).populate("fromUserId", ["firstName", "lastName", "age", "photoUrl"])
            .populate("toUserId", ["firstName", "lastName", "age", "photoUrl"]);

            console.log("user/connections - " + connectionRequests);
        // $project data
        /*
            {
                fromUserId: Akshay,     
                toUserId: Elon,
                status: "accepted"
            }
            {
                fromUserId: Sundar,
                toUserId: Akshay,
                status: "accepted"
            }
        */

            // we want only the OTHER connected person data
        const data = connectionRequests.map(row => {
            // id comparision using toString() or toequals()
            // Since logged-in user is fromUserId, return toUserId
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId; // sent connection requests
            }

            return row.fromUserId; // received connection requests
        });

        res.json({message: "data fetched", data: data});

    } catch (error) {
        res.status(400).send("ERROR - " + error.message);
    }
});

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        
        // user should see all the user cards except 
        // 0. his own card
        // 1. his connections
        // 2. ignored people
        // 3. already sent/received request
        // 4. reported/blocked
        // 5. rejected/accepted

        const loggedInUser = req.user;
        console.log("logged in user -- ", loggedInUser);

        let page = parseInt(req.query.page) || 1; // assume page is num 1
        let limit = parseInt(req.query.limit) || 5; // assume limit is num 5
        
        limit = limit > 50 ? 50 : limit;

        let skip = (page - 1) * limit; // OFFSET

        console.log(page, limit, skip);

        // find all connection requests (send + received)
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id }, 
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId")
        // .populate("fromUserId", "firstName")
        // .populate("toUserId", "firstName");

        /* 
        const excludedUsersFromFeed = new Set();

        without toString() every ID object is unqiue by reference
        connectionRequests.forEach((req) => {
            excludedUsersFromFeed.add(req.fromUserId);
            excludedUsersFromFeed.add(req.toUserId);
        });

        console.log(excludedUsersFromFeed);
        */

        const hideUsersFromFeed = new Set();

        connectionRequests.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });
        
        hideUsersFromFeed.forEach(id => console.log(id));
        
        const hideUsersFromFeedIds = [...hideUsersFromFeed]; // arrays are friendly

        /*
            without toString() every ID object is unqiue object by reference

            use the Spread Operator [...] as your default for converting Sets 
            or cloning arrays. It’s the industry standard for clean, readable modern JavaScript.

            use Array.from() if you need to convert an old-school array-like object (like a NodeList 
            or the arguments object), or if you want to map the data while converting it.
        */
        

        // hide yourself + hiddenUsers
        const users = await User.find({
            $and: [ 
                { _id: { $nin: hideUsersFromFeedIds }, }, // not in array
                { _id: { $ne: loggedInUser._id } } // not equal (exclude self)
            ] // own card + all users whose _id is not present in db
        }).select("firstName lastName photoUrl age gender about skills")
            .skip(skip).limit(limit);
        
        console.log("total feed users -- ", users.length);

        res.send(users); // unique users dont needed in feed


    } catch (error) {
        
        res.status(400).json({message: error.message});
        
    }
});

module.exports = { userRouter }