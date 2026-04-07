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
// RBAC implement - role comes from JWT payload
// tenant middleware can be diff - also comes in JWT payload
/*
    router.post(
    "/listing",         // resource (RBAC strict) a host puts up so others can view/book it
    auth,               // who are you
    tenantMiddleware,   // which tenant
    authorize("host"),  // what can you do
    createListing
);
*/

const userAuth = async (req, res, next) => {
    try {
        console.log("userAuth middleware hit"); 
        console.log("next is:", next);
        // Read the token fron request cookies / req.headers.authorization
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];
        
        try {
            if(!token) {
                throw new Error("token is not valid");
            }
    
            // validate token
            const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
            console.log("DECODED OBJ -- ", decodedObj);
            const { _id } = decodedObj;
    
            // find the user 
            const user = await User.findById(_id).select("-password");
            if (!user) {
                throw new Error("user not found");
            }
    
            req.user = user; // user attached to request object, can attach payload too
    
            next();
    
        } catch(err) {
            res.status(401).send("ERR " + err.message);
        }

    } catch (error) {
        res.status(401).send("ERR - " + error.message);
    }
}

module.exports = {
    userAuth
}