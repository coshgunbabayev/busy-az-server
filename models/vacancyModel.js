const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const { ObjectId } = require("mongodb");
const moment = require("moment");

const vacancySchema = new Schema({
    user: {
        type: ObjectId,
        ref: "User"
    },

    title: {
        type: String,
        required: [true, "Başlıq hissəsi məcburidir"]
    },

    description: {
        type: String,
        required: [true, "Açıqlama hissəsi məcburidir"]
    },

    salary: {
        type: Number,
        required: [true, "Maaş hissəsi məcbiridir"],
        validate: [
            (value) => {
                if (value <= 0 || isNaN(value)) {
                    return false;
                };
                return true;
            },
            
            ,"Maaş bu məğləbdə ola bilməz"
        ]
    },

    location: {
        type: String,
        required: [true, "Ünvan hissəsi məcburidir"]
    },

    date: {
        type: String,
        default: moment().format('YYYY-MM-DD')
    },

    deadline: {
        type: String,
        required: [true, "Bitmə tarixi hissəsi məcburidir"]
    }
},
    {
        timestamps: true
    }
);

const Vacancy = mongoose.model("Vacancy", vacancySchema);

module.exports = { Vacancy };