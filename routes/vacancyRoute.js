const express = require("express");
const router = express.Router();
const {
    getVacancy,
    deleteVacancy,
    getVacancies,
    createVacancy
} = require("../controllers/vacancyController");
const { authenticateToken } = require("../middlewares/authMiddleWare");

router.route("/:id")
    .get(getVacancy)
    .delete(authenticateToken, deleteVacancy);

router.route("/")
    .get(getVacancies)
    .post(authenticateToken, createVacancy);

module.exports = { router };