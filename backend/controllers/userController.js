const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(req.body); // Debugging
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password before saving user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        // Generate and set OTP and expiry
        const otp = crypto.randomInt(100000, 999999).toString();
        newUser.otp = otp;
        newUser.otpExpiry = Date.now() + 1 * 60 * 1000;

        await newUser.save();

        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        // Success response
        res.status(200).json({ success: true, message: "OTP sent to your email.", otpExpiry: newUser.otpExpiry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        
        // OTP and expiry validation
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Mark user as verified, hash password, and clear OTP details
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    console.log("Received request to resend OTP:", req.body);


    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate a new OTP and update expiry
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 1 * 60 * 1000; // 1 minute from now

        await user.save();

        // Send the OTP email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your new OTP code is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        // Send the new OTP expiry time back to the frontend
        res.status(200).json({ 
            success: true,
            message: "New OTP sent to your email.",
            otpExpiry: user.otpExpiry // Pass expiry time to frontend
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Account and verification checks
        if (!user || !user.isActive) {
            return res.status(400).json({ message: "User not found or account is blocked." });
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: "User not verified. Please verify your account." });
        }

        // Password validation
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // JWT generation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = { signUp, verifyOtp, login, resendOtp};

