const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const redis = require('../config/redis');

const userAuth = async (req, res, next) => {
    try {
        // extract token from cookies or api auth header
        const token = 
            req.cookies?.accessToken || req.headers.authorization?.split(" ")[1]
        
        if(!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        // ensure token signature and expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // extracting userId and JTI from this token
        const { _id, jti } = decoded;

        // check redis session
        const session = await redis.get(`refresh:${ _id }: ${ jti }`);

        if(!session) {
            return res.status(401).json({
                error: "Session expired. Please login again"
            });
        }

        // fetch user's safe fields
        const user = await User.findById(_id).select("-password");
        if(!user) {
            return res.status(401).json({
                success: false,
                error: "user not found"
            });
        }

        // attach user + token payload to request
        req.user = user;
        req.auth = decoded; //useful for roles, tenantId, jti later
        /*
            RBAC → req.auth.role  
            multi-tenancy → req.auth.tenantId  
            session tracking → req.auth.jti  
        */

        next(); // move to next middleware / req res cb
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "invalid or expired token"
        });
    }
};

module.exports = { userAuth }
