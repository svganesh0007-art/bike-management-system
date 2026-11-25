
const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/profileController");

router.get("/:userId", getProfile);
router.put("/update/:userId", updateProfile);
router.put("/change-password/:userId", changePassword);

module.exports = router;
