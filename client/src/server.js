// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Temporary storage for OTPs (In production, use Redis or a Database)
const otpStore = {};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your App Password (not your login password)
  }
});

// Route 1: Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  otpStore[email] = otp; // Store OTP mapped to email

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Learnnify Verification Code',
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Route 2: Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email]; // Clear OTP after success
    res.status(200).json({ success: true, message: 'Verified!' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));