
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    fatherName: {
        type: String,
        trim: true,
        default: ""
    },

    dateOfBirth: {
        type: Date,
        default: null
    },

    mobileNumber: {
        type: String,
        trim: true,
        default: ""
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other", ""],
        default: ""
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
