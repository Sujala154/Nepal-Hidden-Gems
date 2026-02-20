const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  adminForgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { signToken } = require("../utils/jwt");

// Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID?.trim());

// Regular auth routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/admin-forgot-password", adminForgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);
router.put("/change-password", auth, changePassword); // Added new route

// Google login route
router.post("/google-login", async (req, res) => {
  console.log("=== GOOGLE LOGIN REQUEST RECEIVED ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request headers:", req.headers);
  
  const { credential } = req.body; // frontend sends 'credential'

  if (!credential) {
    console.error("Google credential missing from request body");
    return res.status(400).json({ 
      success: false, 
      error: "Google credential missing",
      details: "No credential provided in request body"
    });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_CLIENT_ID is not set in environment variables");
    return res.status(500).json({ 
      success: false, 
      error: "Server configuration error: Google Client ID not configured",
      details: "GOOGLE_CLIENT_ID environment variable is missing. Please check backend/.env file"
    });
  }

  try {
    console.log("Starting Google verification...");
    console.log("Using audience:", process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID?.trim(),
    });
    
    console.log("Token verification successful!");

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    console.log("Google payload:", { email, name, googleId });

    // Validate required fields from Google
    if (!email || !name || !googleId) {
      throw new Error(`Missing required Google profile data: email=${!!email}, name=${!!name}, googleId=${!!googleId}`);
    }

    // Find or create user
    let user;
    try {
      user = await User.findOne({ $or: [{ email }, { googleId }] });
      
      if (!user) {
        // Create new user with Google OAuth
        console.log("Creating new Google user...");
        user = new User({
          name,
          email,
          googleId,
          verified: true, // Google users are pre-verified
          role: "traveler",
          // password is not required for Google OAuth users
        });
        await user.save();
        console.log("✅ New Google user created:", user.email);
      } else {
        console.log("Found existing user:", user.email);
        // Update existing user with googleId if they don't have it
        if (!user.googleId) {
          user.googleId = googleId;
          user.verified = true; // Mark as verified if logging in with Google
          await user.save();
          console.log("✅ Updated existing user with Google ID:", user.email);
        }
      }
    } catch (dbError) {
      console.error("Database error during user creation/update:", dbError);
      if (dbError.code === 11000) {
        // Duplicate key error
        throw new Error(`User with email ${email} or googleId ${googleId} already exists`);
      }
      if (dbError.name === 'ValidationError') {
        throw new Error(`User validation failed: ${dbError.message}`);
      }
      throw dbError;
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
        details: "JWT_SECRET is not configured. Please check backend/.env file"
      });
    }

    // Generate JWT token
    let token;
    try {
      token = signToken(
        { userId: user._id, email: user.email, role: user.role },
        "7d"
      );
      console.log("✅ JWT token generated successfully for user:", user.email);
    } catch (tokenError) {
      console.error("JWT token generation error:", tokenError);
      throw new Error(`Failed to generate authentication token: ${tokenError.message}`);
    }

    res.json({
      success: true,
      message: "Google login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("\n=== GOOGLE LOGIN ERROR ===");
    console.error("Error type:", err.constructor.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error name:", err.name);
    
    // Log specific error types
    if (err.message?.includes('Invalid token signature')) {
      console.error("⚠️  TOKEN SIGNATURE ERROR - Client ID mismatch detected!");
      console.error("   Frontend Client ID should match Backend GOOGLE_CLIENT_ID");
    }
    
    if (err.message?.includes('Token used too early') || err.message?.includes('expired')) {
      console.error("⚠️  TOKEN EXPIRATION ERROR - Token may be expired or clock skew issue");
    }
    
    if (err.errors) {
      console.error("Validation errors:", JSON.stringify(err.errors, null, 2));
    }
    
    if (err.stack) {
      console.error("Stack trace:", err.stack);
    }
    
    // Extract more detailed error information
    let errorDetails = err.message || "Unknown error";
    if (err.code) {
      errorDetails += ` (Code: ${err.code})`;
    }
    if (err.name && err.name !== 'Error') {
      errorDetails += ` [${err.name}]`;
    }
    if (err.errors) {
      errorDetails += ` | Validation: ${JSON.stringify(err.errors)}`;
    }
    
    const errorResponse = { 
      success: false, 
      error: "Google login failed",
      details: errorDetails,
      errorType: err.constructor.name,
      errorName: err.name
    };
    
    console.error("=== SENDING ERROR RESPONSE ===");
    console.error("Error response:", JSON.stringify(errorResponse, null, 2));
    console.error("==============================\n");
    
    res.status(400).json(errorResponse);
  }
});

module.exports = router;
