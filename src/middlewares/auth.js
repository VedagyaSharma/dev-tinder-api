// greedy route so req go through it eg /admin/abc
// const adminAuth = (req, res, next) => {
//     const token = "Bearer xyz";
//     const isAdminAuthorized = token === "Bearer xyz";
//     if(!isAdminAuthorized) {
//         res.status(401).send("unauthorized")
//     }
//     else {
//         console.log("authorized ...")
//         next();
//     }
// }

const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
// use JTI for tracking and blacklisting
// generate refresh token and store in Redis store
// rotate JWT refresh tokens similarly

const userAuth = async (req, res, next) => {
    try {
        // Read the token fron request cookies
        const { token } = req.cookies;
        if(!token) {
            throw new Error ("token is not valid");
        }

        // validate token
        const decodedObj = jwt.verify(token, "DEV@Tinder$790");
        const {_id} = decodedObj;

        // find the user 
        const user = await User.findById(_id).select("-password");
        if(!user) {
            throw new Error ("user not found");
        }

        req.user = user; // attached to request

        next();
    } catch (error) {
        res.status(400).send("ERR - " + error.message);
    }
}

module.exports = {
    userAuth
}