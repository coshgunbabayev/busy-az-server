const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.jwt;

    console.log("token ::::::", token);

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.error("Error", err);
                return res.status(400).json({
                    success: false,
                    message: "UserNotFound"
                });
            }

            const user = await User.findById(decoded.userId).select("-password");


            if (!user) {
                console.log("User not found");

                return res.status(400).json({
                    success: false,
                    message: "UserNotFound"
                });;
            };

            req.user = user;
            next();
        });
    } else {
        console.log("User not found");
        res.status(400).json({
            success: false,
            message: "UserNotFound"
        });;
    };
};

module.exports = {
    authenticateToken
};