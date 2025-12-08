const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: Date.now(),
        name,
        email,
        role: role || 'traveler',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Test User',
        email,
        role: 'traveler'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.forgotPassword = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Password reset email sent (simulated)'
  });
};

exports.resetPassword = (req, res) => {
  res.status(200).json({
    success: false,
    message: 'Password reset endpoint'
  });
};