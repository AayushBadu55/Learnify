import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js'; // Note: You MUST add the .js extension here

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

// 1. Check if email exists (Requirement 1)
app.post('/api/auth/check-email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: "Email already registered!" });
        res.status(200).json({ message: "Email available" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 2. Final Registration (Requirement 2)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, phone, userType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phone,
            userType
        });

        await newUser.save();
        res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Registration failed" });
    }
});

// 3. Login Validation (Requirement 2)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({
            message: "Login successful",
            user: {
                name: user.fullName,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
});

// 4. Update Profile Endpoint
app.put('/api/auth/update-profile', async (req, res) => {
    try {
        const { email, fullName, phone, profilePicture } = req.body;

        // Find user by email and update
        // { new: true } returns the updated document
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { fullName, phone, profilePicture },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.fullName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// Nodemailer Config Removed (Using EmailJS on client)

// 5. Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB with expiry (10 minutes)
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Return OTP and userName to client for EmailJS
        res.status(200).json({
            message: "OTP Generated",
            otp: otp,
            userName: user.fullName
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// 6. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({ message: "OTP Verified" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 7. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));