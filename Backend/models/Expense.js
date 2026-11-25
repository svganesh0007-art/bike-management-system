
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({

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

    expenseDate: {
        type: Date,
        required: true
    },

    category: {
        type: String,
        required: true,
        enum: [
            "Petrol",
            "Repair",
            "Spare Parts",
            "Insurance",
            "Accessories",
            "Other"
        ]
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    description: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
