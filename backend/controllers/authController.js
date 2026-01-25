const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendVerificationOTP } = require("../services/emailServices");
const { sendResetEmail } = require("../services/emailServices");
const { signToken } = require("../utils/jwt");
const { isEmail, isStrongPassword } = require("../utils/validators");

const normalizeEmail = (email = "") => email.toLowerCase().trim();

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bio, specialty, languages, phoneNumber, verification_documents } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, password are required" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, error: "Invalid email" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    // Validate role
    const validRoles = ["traveler", "contributor", "guide", "admin"];
    const selectedRole = role || "traveler";
    if (!validRoles.includes(selectedRole)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }

    // Validate role-specific fields
    if ((selectedRole === "contributor" || selectedRole === "guide") && !bio) {
      return res.status(400).json({ success: false, error: "Bio is required for " + selectedRole + " role" });
    }

    if (selectedRole === "guide") {
      if (!specialty || !Array.isArray(specialty) || specialty.length === 0) {
        return res.status(400).json({ success: false, error: "At least one specialty is required for guide role" });
      }
      if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return res.status(400).json({ success: false, error: "At least one language is required for guide role" });
      }
      if (!phoneNumber) {
        return res.status(400).json({ success: false, error: "Phone number is required for guide role" });
      }
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
    if (exists) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Build user object based on role
    const userData = {
      name,
      email: normalizedEmail,
      password: hashed,
      role: selectedRole,
      verificationOTP: otp,
      verificationOTPExpires: otpExpires,
    };

    if (phoneNumber) {
      userData.phoneNumber = phoneNumber;
    }

    // Add role-specific fields
    if (selectedRole === "contributor" || selectedRole === "guide") {
      userData.bio = bio;
    }

    if (selectedRole === "guide") {
      userData.specialty = specialty;
      userData.languages = languages;
      if (verification_documents && Array.isArray(verification_documents)) {
        userData.verification_documents = verification_documents;
      }
    }

    const user = await User.create(userData);

    await sendVerificationOTP(normalizedEmail, otp, name);

    return res.status(201).json({
      success: true,
      message: "Registered. Please verify OTP sent to email.",
      user: { id: user._id, email: user.email, role: user.role, verified: user.verified },
    });
  } catch (error) {
    console.error("register error", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Server error during registration" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and OTP required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({
      email: normalizedEmail,
      verificationOTP: otp,
      verificationOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    // Generate token for auto-login
    const token = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

    return res.json({
      success: true,
      message: "Email verified",
      token,
      user: { id: user._id, email: user.email, role: user.role, verified: user.verified, name: user.name },
    });
  } catch (error) {
    console.error("verifyOtp error", error);
    return res.status(500).json({ success: false, error: "Server error during verification" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationOTP(normalizedEmail, otp, user.name);

    return res.json({ success: true, message: "OTP resent" });
  } catch (error) {
    console.error("resendOtp error", error);
    return res.status(500).json({ success: false, error: "Server error while resending OTP" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

    // Handle users who registered with Google (no password)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        error: "This account uses Google Sign-In. Please login with Google."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });

    if (!user.verified) {
      return res.status(403).json({ success: false, error: "Please verify email first", requiresVerification: true });
    }

    const token = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified },
    });
  } catch (error) {
    console.error("login error", error);
    return res.status(500).json({ success: false, error: "Server error during login" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = resetHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send reset link email
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    await sendResetEmail(normalizedEmail, user.name, resetUrl);

    return res.json({
      success: true,
      message: "Password reset link sent",
      resetTokenDev: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("forgotPassword error", error);
    return res.status(500).json({ success: false, error: "Server error during password reset request" });
  }
};

exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(404).json({ success: false, error: "Admin account not found" });

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Access denied. This recovery portal is for administrators only." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = resetHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    await sendResetEmail(normalizedEmail, user.name, resetUrl);

    return res.json({
      success: true,
      message: "Admin password reset link sent",
      resetTokenDev: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("adminForgotPassword error", error);
    return res.status(500).json({ success: false, error: "Server error during admin password reset request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, error: "Token and password required" });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    const resetHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetHash,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, error: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error", error);
    return res.status(500).json({ success: false, error: "Server error during password reset" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.body.profileImage) updates.profileImage = req.body.profileImage;
    if (req.body.role) updates.role = req.body.role; // ensure role enforced elsewhere (admin)

    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
      }
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current and new password required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (!user.password) {
      return res.status(400).json({ success: false, error: "This account uses Google Sign-In. Please set a password first." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Incorrect current password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("changePassword error", error);
    return res.status(500).json({ success: false, error: "Server error during password update" });
  }
};