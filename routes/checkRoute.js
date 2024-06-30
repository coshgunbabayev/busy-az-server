const express = require("express");
const router = express.Router();
const {
    user
} = require("../controllers/checkController");
const { authenticateToken } = require("../middlewares/authMiddleWare");

router.route("/user")
    .get(authenticateToken, user);

module.exports = { router };