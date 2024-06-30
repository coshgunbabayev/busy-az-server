const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(400).json({
                success: false,
                message: "UserNotFound"
            });

            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "UserNotFound"
                });;
            };

            req.user = user;
            next();
        });
    } else {
        res.status(400).json({
            success: false,
            message: "UserNotFound"
        });;
    };
};

module.exports = {
    authenticateToken
};