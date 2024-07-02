const { User } = require("../models/userModel");
const { Vacancy } = require("../models/vacancyModel");
const bcrypt = require("bcryptjs");
const {
    createTokenForLogin
} = require("../token/createToken");

const createUser = async (req, res) => {
    try {
        const keys = ["userrole", "name", "email", "phone", "password"];

        Object.keys(req.body).forEach(key => {
            if (!keys.includes(key)) {
                return res.status(400).json({ success: false });
            };
        });
        const user = await User.create(req.body);

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

        if (err.name === "MongoServerError" && err.code === 11000) {
            if (err.keyPattern.email) {
                errors.email = "Bu e-poçt artıq istifadə olunub";
            };

            if (err.keyPattern.phone) {
                errors.phone = "Bu telefon nömrəsi artıq istifadə olunub";
            };
        };

        res.status(400).json({
            success: false,
            errors
        });
    };
};

const loginUser = async (req, res) => {
    const keys = ["email", "password"];

    Object.keys(req.body).forEach(key => {
        if (!keys.includes(key)) {
            return res.status(400).json({ success: false });
        };
    });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    let errors = new Object();

    if (!Boolean(email) || !Boolean(password)) {
        if (!Boolean(email)) {
            errors.email = "E-poçt hissəsi məcburidir";
        };

        if (!Boolean(password)) {
            errors.password = "Parol hissəsi məcburidir";
        };

        return res.status(400).json({
            success: false,
            errors
        });
    };

    if (!user) {
        return res.status(400).json({
            success: false,
            errors: { email: "E-poçt yanlışdır" }
        });
    };

    if (await bcrypt.compare(password, user.password)) {
        let token = await createTokenForLogin(user._id);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        });

        res.status(200).json({
            success: true,
            userrole: user.userrole
        });

    } else {
        res.status(400).json({
            success: false,
            errors: { password: "Parol yanlışdır" }
        });
    };
};

const updateUser = async (req, res) => {
    const keys = ["name", "email", "phone", "currentpassword", "newpassword1", "newpassword2"];

    Object.keys(req.body).forEach(key => {
        if (!keys.includes(key)) {
            return res.status(400).json({ success: false });
        };
    });

    let errors = new Object();

    const { name, email, phone, currentpassword, newpassword1, newpassword2 } = req.body;

    const user = await User.findById(req.user._id);

    if (user.name !== name || user.email !== email || user.phone !== phone || (currentpassword || newpassword1 || newpassword2)) {

        if (!Boolean(name)) {
            errors.name = "Ad hissəsi məcburidir";
        };

        if (!Boolean(email)) {
            errors.email = "E-poçt hissəsi məcburidir";
        };

        if (!Boolean(phone)) {
            errors.phone = "Phone hissəsi məcburidir";
        };

        if (currentpassword || newpassword1 || newpassword2) {
            if (!currentpassword) {
                errors.currentpassword = "Mövcud parol hissəsi məcburidir";
            } else if (!await bcrypt.compare(currentpassword, user.password)) {
                errors.currentpassword = "Mövcud parol düzgün deyil";
            } else {
                if (!Boolean(newpassword1)) {
                    errors.newpassword1 = "Yeni parol hissəsi məcburidir";
                } else if (!Boolean(newpassword2)) {
                    errors.newpassword2 = "Yeni parolun təkrar hissəsi məcburidir";
                } else if (newpassword1 !== newpassword2) {
                    errors.newpassword2 = "Yeni parolun təkrarı düzgün deyil";
                };
            };
        };

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        };

        try {
            user.name = name;
            user.email = email;
            user.phone = phone;
            if (currentpassword) {
                user.password = newpassword1;
            };
            await user.save();

            res.status(200).json({ success: true });
        } catch (err) {
            console.log(err);
            if (err.name === "ValidationError") {
                Object.keys(err.errors).forEach(key => {
                    errors[key] = err.errors[key].message;
                });
            };

            if (err.name === "MongoServerError" && err.code === 11000) {
                if (err.keyPattern.email) {
                    errors.email = "Bu e-poçt artıq istifadə olunub";
                };

                if (err.keyPattern.phone) {
                    errors.phone = "Bu telefon nömrəsi artıq istifadə olunub";
                };
            };

            res.status(400).json({
                success: false,
                errors
            });
        };

        return
    };

    res.status(200).json({ success: true });
};

const updateFreelancer = async (req, res) => {
    const keys = ["name", "gender", "birthday", "country", "city", "phone", "email", "workarea", "description"];

    Object.keys(req.body).forEach(key => {
        if (!keys.includes(key)) {
            return res.status(400).json({ success: false });
        };
    });

    const { name, gender, birthday, country, city, phone, email, workarea, description } = req.body;

    const user = await User.findById(req.user._id);

    if (user.userrole !== "freelancer") {
        return res.status(400).json({ success: false });
    };

    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                name,
                gender,
                birthday,
                country,
                city,
                phone,
                email,
                workarea,
                description
            },
            {
                new: true,
                runValidators: true,
                context: "query"
            }
        );

        res.status(200).json({ success: true });
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

const getCurrentUser = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

const getFreelancers = async (req, res) => {
    const freelancers = await User.find({ userrole: "freelancer" })
        .select("-password -updatedAt -createdAt");

    freelancers.reverse();

    res.status(200).json({
        success: true,
        freelancers
    });
};

const getFreelancer = async (req, res) => {
    let freelancer;
    try {
        freelancer = await User.findOne({
            _id: req.params.id,
            userrole: "freelancer"
        }).select("-password -updatedAt -createdAt");
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "UserNotFound"
        });
    };

    if (!freelancer) {
        return res.status(404).json({ success: false });
    };

    res.status(200).json({
        success: true,
        freelancer
    });
};

const getEmployerVacancies = async (req, res) => {
    if (req.user.userrole !== "employer") {
        return res.status(400).json({
            success: false,
            message: "UserIsNotEmployee"
        });
    };

    const vacancies = await Vacancy.find({ user: req.user._id });

    vacancies.reverse();

    res.status(200).json({
        success: true,
        vacancies
    });
};

const logOutUser = (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.status(200).json({ success: true });
};

const lookVacancy = async (req, res) => {
    let vacancy;
    try {
        vacancy = await Vacancy.findById(req.params.id);
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

    if (req.user.userrole !== "freelancer") {
        return res.status(200).json({
            success: false,
            message: "UserroleIsNotFreelancer"
        });
    };

    let user = await User.findById(req.user._id);

    user = user.addLookVacancy(vacancy._id);

    res.status(200).json({
        success: true
    });
};

const getLooks = async (req, res) => {
    const vacancies = await Vacancy.find({ _id: { $in: req.user.looks } })
        .populate("user", "-password -_id");

    vacancies.reverse();

    res.status(200).json({
        success: true,
        vacancies
    });
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    updateFreelancer,
    getCurrentUser,
    getFreelancers,
    getFreelancer,
    getEmployerVacancies,
    logOutUser,
    lookVacancy,
    getLooks,
};