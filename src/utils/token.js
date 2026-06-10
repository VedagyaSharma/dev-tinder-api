const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateTokens = (user) => {

    const jti = uuidv4(); //  uniquely identify this specific token so you can track, revoke, or detect replay attacks.

    // who + which token (encoded not encrypted)
    const accessToken = jwt.sign(
        { _id: user._id, jti }, // access token use lesser jti
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
        { _id: user._id, jti }, // { _id: user._id, jti: jti } SAME
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    // Store jti in DB/Redis for this user/session
    const storeJTI = async () => await sessionRepo.create({
        userId: user._id,
        jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        replacedBy: null,
    });

    return { accessToken, refreshToken, jti, storeJTI }
};

module.exports = { generateTokens }

/*
    Access token in memory on frontend, not localStorage if you can avoid it.

    Refresh token in HttpOnly; Secure; SameSite=Lax cookie.

    Enforce HTTPS in production.

    Rate-limit signup, login, refresh, resend-verification.

    Store refresh token metadata in Redis or DB: userId, jti, expiresAt, revokedAt,
    replacedBy, ip, userAgent. Refresh token revocation via server-side storage is explicitly recommended

    Access token in response header/body, short expiry.

    Refresh token in an HttpOnly, Secure cookie.

    /refresh uses jti to validate and rotate the session.
*/