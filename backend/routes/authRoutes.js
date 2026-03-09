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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID?.trim());

// Standard authentication routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/admin-forgot-password", adminForgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);
router.put("/change-password", auth, changePassword);

// Google Sign-In endpoint
router.post("/google-login", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, error: "Missing Google credential" });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ success: false, error: "Google Auth is not configured on the server" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID?.trim(),
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    if (!email || !name || !googleId) {
      throw new Error("Required profile data from Google is missing");
    }

    // Attempt to find or register the user
    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        verified: true,
        role: "traveler",
      });
      await user.save();
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      user.verified = true;
      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, error: "Token generation failed due to configuration" });
    }

    const token = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

    res.json({
      success: true,
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
    console.error("Google verify error:", err.message);
    res.status(400).json({ 
      success: false, 
      error: "Google login verification failed", 
      details: err.message 
    });
  }
});

module.exports = router;


module.exports = router;
