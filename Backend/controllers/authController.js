
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        await user.save();

        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const hashedOtp = await bcrypt.hash(otpCode, 10);

        await Otp.deleteMany({
            email: normalizedEmail,
            purpose: "registration"
        });

        await Otp.create({
            email: normalizedEmail,
            otp: hashedOtp,
            purpose: "registration",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        const mailInfo = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: "Bike Management - Email Verification OTP",
            text: `Your OTP is ${otpCode}. It is valid for 5 minutes. Do not share this OTP with anyone.`
        });

        console.log("OTP EMAIL SENT SUCCESSFULLY:", mailInfo.messageId);

        res.status(201).json({
            success: true,
            message: "OTP sent successfully to your email"
        });

    } catch (error) {
        console.error("EMAIL SENDING ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to send OTP. Please check email configuration."
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await Otp.findOne({
            email: normalizedEmail,
            purpose: "registration"
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        await User.updateOne(
            { email: normalizedEmail },
            { isVerified: true }
        );

        await Otp.deleteOne({ _id: otpRecord._id });

        res.json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("OTP VERIFICATION ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (user) {
            const otpCode = crypto.randomInt(100000, 1000000).toString();
            const hashedOtp = await bcrypt.hash(otpCode, 10);

            await Otp.deleteMany({
                email: normalizedEmail,
                purpose: "password-reset"
            });

            await Otp.create({
                email: normalizedEmail,
                otp: hashedOtp,
                purpose: "password-reset",
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: normalizedEmail,
                subject: "Bike Management - Password Reset OTP",
                text: `Your password reset OTP is ${otpCode}. It is valid for 5 minutes. Do not share this OTP with anyone.`
            });
        }

        res.json({
            success: true,
            message: "If the email is registered, a reset OTP has been sent."
        });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to process password reset request"
        });
    }
};

const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await Otp.findOne({
            email: normalizedEmail,
            purpose: "password-reset"
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Reset OTP not found"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        otpRecord.verified = true;
        otpRecord.resetToken = hashedToken;
        otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await otpRecord.save();

        res.json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });

    } catch (error) {
        console.error("RESET OTP ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to verify reset OTP"
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const otpRecord = await Otp.findOne({
            email: normalizedEmail,
            purpose: "password-reset",
            verified: true,
            resetToken: hashedToken,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset session. Please try again."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOneAndUpdate(
            { email: normalizedEmail },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await Otp.deleteOne({ _id: otpRecord._id });

        res.json({
            success: true,
            message: "Password reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to reset password"
        });
    }
};

module.exports = {
    registerUser,
    verifyOtp,
    loginUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword
};
