
const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyOtp,
    loginUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
