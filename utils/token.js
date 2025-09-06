import jwt from 'jsonwebtoken';

const generateAccessToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "5m" });
}

const generateRefreshToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export {
    generateAccessToken,
    generateRefreshToken
}