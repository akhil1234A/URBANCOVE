const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//User : Sign Up 
const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(req.body); // Debugging
    try {
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                if (existingUser.otpExpiry < Date.now()) {
                    // Remove unverified expired user
                    await User.deleteOne({ email });
                } else {
                    return res.status(400).json({ 
                        message: "User already exists but not verified. Please verify your account or wait for the OTP to expire." 
                    });
                }
            } else {
                return res.status(400).json({ message: "User already exists." });
            }
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

       
        const otp = crypto.randomInt(100000, 999999).toString();
        newUser.otp = otp;
        newUser.otpExpiry = Date.now() + 1 * 60 * 1000;

        await newUser.save();

        
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

        
        res.status(200).json({ success: true, message: "OTP sent to your email.", otpExpiry: newUser.otpExpiry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//User : Verify OTP, After Sign Up
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.status(200).json({ 
            success: true, 
            message: "User registered successfully.",
            token,
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                isActive: user.isActive, 
                isVerified: user.isVerified 
              }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//User: Resend OTP, In Verification Flow 
const resendOtp = async (req, res) => {
    const { email } = req.body;
    console.log("Received request to resend OTP:", req.body);


    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 1 * 60 * 1000; 

        await user.save();

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

        res.status(200).json({ 
            success: true,
            message: "New OTP sent to your email.",
            otpExpiry: user.otpExpiry 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//User: Login 
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        // console.log(user);
        // Account and verification checks
        if (!user || !user.isActive) {
            return res.status(400).json({ message: "User not found or account is blocked." });
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: "User not verified. Please verify your account." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        // console.log(isMatch);
        // JWT generation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            token,
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                isActive: user.isActive, 
                isVerified: user.isVerified 
              }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//User: Google Auth 
  const googleAuth = async (req, res) => {
    const { email, name, googleID } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name, googleID });
        } else {
            if (!user.isActive) {
                return res.status(400).json({ message: "User not found or account is blocked." });
            }
            user.googleID = googleID;
            await user.save();
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({ success: true, user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            isActive: user.isActive, 
            googleId: user.googleID
          }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during Google authentication' });
    }
};

//User: Update Password 
const updatePassword = async (req,res)=>{
    const { newPassword } = req.body;
    const userId = req.user.id; 


    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}


//User: Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes

        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Password reset link sent to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending password reset email", error: error.message });
    }
};

//User: Reset Password
const resetPassword = async (req, res) => {
   const { token } = req.params;
   const { newPassword } = req.body;
  
  

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Check token validity
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};


module.exports = { signUp, verifyOtp, login, resendOtp, googleAuth, updatePassword, forgotPassword, resetPassword};

