const { User } = require('../models/userModel');
const { Vacancy } = require("../models/vacancyModel");

const getVacancy = async (req, res) => {
    let vacancy;
    try {
        vacancy = await Vacancy.findById(req.params.id)
            .populate("user", "-password -_id");
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "VacancyNotFound"
        });
    };

    res.status(200).json({
        success: true,
        vacancy
    });
};

const deleteVacancy = async (req, res) => {
    let vacancy;
    try {
        vacancy = await Vacancy.findById(req.params.id)
            .populate("user", "-password");
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "VacancyNotFound"
        });
    };

    if (!vacancy) {
        return res.status(400).json({
            success: false,
            message: "VacancyNotFound"
        });
    };

    if (!vacancy.user._id.equals(req.user._id)) {
        return res.status(400).json({
            success: false,
            message: "UserIsNotOwner"
        });
    };

    await Vacancy.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true
    });
};

const getVacancies = async (req, res) => {
    const vacancies = await Vacancy.find({})
        .populate("user", "-password -_id");

    vacancies.reverse();

    res.status(200).json({
        success: true,
        vacancies
    });
};

const createVacancy = async (req, res) => {
    if (req.user.userrole !== "employer") {
        return res.status(400).json({
            success: false,
            message: "UserroleIsNotEmployer"
        });
    };

    const keys = ["title", "description", "salary", "location", "deadline"];

    Object.keys(req.body).forEach(key => {
        if (!keys.includes(key)) {
            return res.status(400).json({ success: false });
        };
    });

    try {
        const { title, description, salary, location, deadline } = req.body;
        const vacancy = await Vacancy.create({
            id: req.user._id,
            user: req.user._id,
            title: title,
            description: description,
            salary: Number(salary),
            location: location,
            deadline: deadline,
        })

        res.status(201).json({
            success: true
        });
    } catch (err) {
        let errors = new Object();

        if (err.name === "ValidationError") {
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
        };

        res.status(400).json({
            success: false,
            errors
        });
    };
};

module.exports = {
    getVacancy,
    deleteVacancy,
    getVacancies,
    createVacancy
};