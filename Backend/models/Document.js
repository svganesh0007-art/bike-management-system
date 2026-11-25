
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({

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

    documentType: {
        type: String,
        required: true,
        enum: [
            "RC Book",
            "Insurance",
            "Driving Licence",
            "Pollution Certificate",
            "Other"
        ]
    },

    documentNumber: {
        type: String,
        required: true,
        trim: true
    },

    issueDate: {
        type: Date,
        required: true
    },

    expiryDate: {
        type: Date,
        required: true
    },

    fileUrl: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
