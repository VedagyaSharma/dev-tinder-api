const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // 10 attempts
    message: "Too many login attempts, try later"
});

module.exports = { loginLimiter };