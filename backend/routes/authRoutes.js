const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationOTP } = require('../services/emailServices');

// Register with OTP
router.post('/register', async (req, res) => {
  try {
    console.log('\n=== REGISTER REQUEST ===');
    console.log('📦 Body:', req.body);
    
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide all required fields' 
      });
    }

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Checking for email:', normalizedEmail);

    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(400).json({ 
        success: false,
        error: `Email "${normalizedEmail}" is already registered.` 
      });
    }

    console.log('✅ Email available, creating user...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (not verified yet)
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'traveler',
      verificationOTP: otp,
      verificationOTPExpires: otpExpires
    });

    await user.save();
    console.log('✅ User saved with ID:', user._id);

    // Send OTP email
    const emailResult = await sendVerificationOTP(normalizedEmail, otp, name);

    // Check if email was actually sent
    if (!emailResult || !emailResult.success) {
      console.log('⚠️ Email sending failed');
      console.log('🔢 OTP:', otp);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Please use the OTP below to verify your email.',
        requiresVerification: true,
        email: normalizedEmail,
        otp: otp,
        emailSent: false
      });
    }

    console.log('✅ Email sent successfully');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      requiresVerification: true,
      email: normalizedEmail,
      emailSent: true
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during registration' 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('\n=== VERIFY OTP REQUEST ===');
    console.log('📦 Body:', req.body);
    
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and OTP are required' 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Verifying OTP for:', normalizedEmail);

    // Find user
    const user = await User.findOne({ 
      email: normalizedEmail,
      verificationOTP: otp,
      verificationOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired OTP');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired OTP' 
      });
    }

    console.log('✅ OTP valid, verifying user...');
    
    // Mark as verified
    user.verified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    console.log('✅ User verified:', user.email);
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during OTP verification' 
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    if (user.verified) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already verified' 
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOTP = otp;
    user.verificationOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailResult = await sendVerificationOTP(email, otp, user.name);

    if (!emailResult || !emailResult.success) {
      return res.json({
        success: true,
        message: 'New OTP generated but email not sent. Check console for OTP.',
        otp: otp,
        emailSent: false
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully!',
      emailSent: true
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while resending OTP' 
    });
  }
});

// Login (checks verification) - UPDATED WITH DEBUG LOGS
router.post('/login', async (req, res) => {
  try {
    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('📦 Body:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false,
        error: 'Please provide email and password' 
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Searching for user:', normalizedEmail);

    // Find user (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    console.log('🔍 User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('📊 User details:', {
        email: user.email,
        verified: user.verified,
        role: user.role
      });
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.verified) {
      console.log('❌ User not verified');
      return res.status(403).json({ 
        success: false,
        error: 'Please verify your email first',
        requiresVerification: true,
        email: user.email
      });
    }

    console.log('✅ All checks passed, creating token...');
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Token created, login successful');
    console.log('📋 User data to return:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login' 
    });
  }
});

module.exports = router;