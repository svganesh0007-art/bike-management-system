
const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    bikeName: {
        type: String,
        required: true,
        trim: true
    },

    brand: {
        type: String,
        required: true
    },

    model: {
        type: String,
        required: true
    },

    registrationNumber: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    },

    fuelType: {
        type: String,
        required: true
    },

    purchaseDate: {
        type: Date,
        required: true
    }

}, {
    timestamps: true
});

const Bike = mongoose.model("Bike", bikeSchema);

module.exports = Bike;
