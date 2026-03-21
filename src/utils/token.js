const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateTokens = (user) => {
    const jti = uuidv4();

    // hiding userId adn JTI under these tokens
    const accessToken = jwt.sign(
        { _id: user._id, jti },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
        { _id: user._id, jti },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken, jti }
};

module.exports = { generateTokens }