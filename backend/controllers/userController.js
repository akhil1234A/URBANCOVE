const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body)
    console.log(name);
    try {
   
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

      
        const newUser = new User({ name, email, password }); // save without password initially

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
        newUser.otp = otp;
        newUser.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        await newUser.save();

        // Send OTP via email
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

        res.status(200).json({ message: "OTP sent to your email." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Check if OTP is expired
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.isVerified = true;
        user.password = await bcrypt.hash(user.password, 10); // Hash password
        user.otp = undefined; // Clear OTP
        user.otpExpiry = undefined; // Clear expiry time
        await user.save();

        res.status(200).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        // Check if the user exists and if they are active
        if (!user || !user.isActive) {
            return res.status(400).json({ message: "User not found or account is blocked." });
        }

        // Check if the user has been verified
        // if (!user.isVerified) {
        //     return res.status(400).json({ message: "User not verified. Please verify your account." });
        // }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { signUp, verifyOtp, login };

