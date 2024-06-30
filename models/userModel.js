const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const { ObjectId } = require("mongodb");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
    userrole: {
        type: String,
        required: true,
        validate: [
            (value) => {
                if (value === "employer" || value === "freelancer") {
                    return true;
                };
                return false;
            },

            "userrole düzgün deyil"
        ]
    },

    name: {
        type: String,
        required: [true, "Ad hissəsi məcburidir"],
    },

    email: {
        type: String,
        required: [true, "E-poçt hissəsi məcburidir"],
        unique: true,
        validate: [validator.isEmail, "E-poçt düzgün deyil"],
    },

    phone: {
        type: String,
        required: [true, "Phone hissəsi məcburidir"],
        unique: true
    },

    password: {
        type: String,
        required: [true, "Parol hissəsi məcburidir"],
        minLength: [8, "Parol ən azı 8 simvoldan ibarət olmalıdır"],
    },

    looks: [
        {
            type: ObjectId,
            ref: "Vacancy"
        }
    ],

    gender: {
        type: String,
        default: "",
        validate: [
            (value) => {
                if (value === "man" || value === "woman" || value === "") {
                    return true;
                };
                return false;
            },

            "Cins düzgün deyil"
        ]
    },

    birthday: {
        type: String,
        default: ""
    },

    country: {
        type: String,
        default: ""
    },

    city: {
        type: String,
        default: ""
    },
    
    workarea: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },
},
    {
        timestamps: true
    }
);

userSchema.pre("save", function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return console.log(err.message);
        user.password = hash;
        next();
    });
});

userSchema.methods.addLookVacancy = async function (id) {
    user = this;
    if (!user.looks.includes(id)) {
        user.looks.push(id);
    };

    if (user.looks.length > 10) {
        user.looks = user.looks.slice(-10);
    };

    await user.save();
    return user;
};

const User = mongoose.model("User", userSchema);

module.exports = { User };