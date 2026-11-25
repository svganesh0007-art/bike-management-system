
const express = require("express");
const router = express.Router();

const {
    addDocument,
    getBikeDocuments,
    updateDocument,
    deleteDocument
} = require("../controllers/documentController");

const upload = require("../middleware/upload");

router.post("/add", upload.single("documentFile"), addDocument);
router.get("/bike/:bikeId", getBikeDocuments);
router.put("/update/:documentId", upload.single("documentFile"), updateDocument);
router.delete("/delete/:documentId", deleteDocument);

module.exports = router;
