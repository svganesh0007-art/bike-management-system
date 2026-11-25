
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    bikeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike",
        required: true
    },

    serviceDate: {
        type: Date,
        required: true
    },

    serviceCenter: {
        type: String,
        required: true,
        trim: true
    },

    serviceType: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    nextServiceDate: {
        type: Date
    }

}, {
    timestamps: true
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
