
const Document = require("../models/Document");
const Bike = require("../models/Bike");
const fs = require("fs");
const path = require("path");

const removeUploadedFile = (fileUrl) => {
    if (!fileUrl) return;

    const fileName = path.basename(fileUrl);
    const filePath = path.join(__dirname, "../uploads", fileName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const addDocument = async (req, res) => {
    try {
        const {
            userId,
            bikeId,
            documentType,
            documentNumber,
            issueDate,
            expiryDate
        } = req.body;

        if (!userId || !bikeId || !documentType || !documentNumber || !issueDate || !expiryDate) {
            if (req.file) removeUploadedFile(req.file.filename);

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document file"
            });
        }

        const bike = await Bike.findOne({ _id: bikeId, userId });

        if (!bike) {
            removeUploadedFile(req.file.filename);

            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        if (new Date(expiryDate) < new Date(issueDate)) {
            removeUploadedFile(req.file.filename);

            return res.status(400).json({
                success: false,
                message: "Expiry date cannot be before issue date"
            });
        }

        const document = await Document.create({
            userId,
            bikeId,
            documentType,
            documentNumber,
            issueDate,
            expiryDate,
            fileUrl: `/uploads/${req.file.filename}`
        });

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document
        });

    } catch (error) {
        if (req.file) removeUploadedFile(req.file.filename);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getBikeDocuments = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const { userId } = req.query;

        const bike = await Bike.findOne({ _id: bikeId, userId });

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        const documents = await Document.find({ bikeId, userId });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = documents.map(document => {
            const expiry = new Date(document.expiryDate);
            expiry.setHours(0, 0, 0, 0);

            const daysLeft = Math.ceil(
                (expiry - today) / (1000 * 60 * 60 * 24)
            );

            let status = "Valid";

            if (daysLeft < 0) {
                status = "Expired";
            } else if (daysLeft <= 30) {
                status = "Expiring Soon";
            }

            return {
                ...document.toObject(),
                status,
                daysLeft
            };
        });

        res.status(200).json({
            success: true,
            documents: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const {
            userId,
            documentType,
            documentNumber,
            issueDate,
            expiryDate
        } = req.body;

        if (!userId || !documentType || !documentNumber || !issueDate || !expiryDate) {
            if (req.file) removeUploadedFile(req.file.filename);

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (new Date(expiryDate) < new Date(issueDate)) {
            if (req.file) removeUploadedFile(req.file.filename);

            return res.status(400).json({
                success: false,
                message: "Expiry date cannot be before issue date"
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId
        });

        if (!document) {
            if (req.file) removeUploadedFile(req.file.filename);

            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        document.documentType = documentType;
        document.documentNumber = documentNumber;
        document.issueDate = issueDate;
        document.expiryDate = expiryDate;

        if (req.file) {
            removeUploadedFile(document.fileUrl);
            document.fileUrl = `/uploads/${req.file.filename}`;
        }

        await document.save();

        res.status(200).json({
            success: true,
            message: "Document updated successfully",
            document
        });

    } catch (error) {
        if (req.file) removeUploadedFile(req.file.filename);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        removeUploadedFile(document.fileUrl);
        await Document.deleteOne({ _id: documentId, userId });

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addDocument,
    getBikeDocuments,
    updateDocument,
    deleteDocument
};
