const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendVerificationOTP, sendResetEmail } = require("../services/emailServices");
const { signToken } = require("../utils/jwt");
const { isEmail, isStrongPassword } = require("../utils/validators");
const catchAsync = require("../utils/catchAsync");

const normalizeEmail = (email = "") => email.toLowerCase().trim();

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, bio, specialty, languages, phoneNumber, verification_documents } = req.body;

  // Basic sanity checks
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Please provide name, email, and password." });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ success: false, error: "That doesn't look like a valid email address." });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
  }

  // Role policy enforcement
  const validRoles = ["traveler", "contributor", "guide", "admin"];
  const assignedRole = role || "traveler";
  
  if (!validRoles.includes(assignedRole)) {
    return res.status(400).json({ success: false, error: "Invalid role assigned." });
  }

  if (["contributor", "guide"].includes(assignedRole) && !bio) {
    return res.status(400).json({ success: false, error: `A professional bio is required for ${assignedRole}s.` });
  }

  if (assignedRole === "guide") {
    if (!specialty?.length || !languages?.length) {
      return res.status(400).json({ success: false, error: "Guides must provide specialties and languages." });
    }
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "A contact phone number is required for guides." });
    }
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
  
  if (existingUser) {
    return res.status(400).json({ success: false, error: "This email is already associated with an account." });
  }

  // Security: Hash password and generate 6-digit OTP
  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const newUserData = {
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: assignedRole,
    verificationOTP: verificationCode,
    verificationOTPExpires: codeExpiry,
    phoneNumber,
    bio,
    specialty,
    languages,
    verification_documents: assignedRole === "guide" ? verification_documents : undefined
  };

  const user = await User.create(newUserData);

  // Notify user via email
  await sendVerificationOTP(normalizedEmail, verificationCode, name);

  res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email for the verification code.",
    user: { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      verified: user.verified 
    },
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and verification code are required." });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({
    email: normalizedEmail,
    verificationOTP: otp,
    verificationOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: "The code is either invalid or has expired." });
  }

  user.verified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;
  await user.save();

  // Issue session token for immediate access
  const sessionToken = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

  res.json({
    success: true,
    message: "Email verified successfully.",
    token: sessionToken,
    user: { 
      id: user._id, 
      name: user.name,
      email: user.email, 
      role: user.role, 
      verified: user.verified 
    },
  });
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required." });

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ success: false, error: "No account found with this email." });

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationOTP = newCode;
  user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationOTP(normalizedEmail, newCode, user.name);

  res.json({ success: true, message: "A new verification code has been sent." });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Please provide both email and password." });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
  
  if (!user) return res.status(401).json({ success: false, error: "Incorrect email or password." });

  // Guard against standard login for Google-only accounts
  if (!user.password) {
    return res.status(400).json({
      success: false,
      error: "This account is linked with Google. Please use 'Sign in with Google'."
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, error: "Incorrect email or password." });

  if (!user.verified) {
    return res.status(403).json({ 
      success: false, 
      error: "Account not verified.", 
      requiresVerification: true 
    });
  }

  const authToken = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

  res.json({
    success: true,
    message: "Welcome back!",
    token: authToken,
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      verified: user.verified 
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required." });

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ success: false, error: "No account found with this email address." });

  const resetToken = crypto.randomBytes(20).toString("hex");
  const secureHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  
  user.resetPasswordToken = secureHash;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min window
  await user.save();

  const recoveryLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  await sendResetEmail(normalizedEmail, user.name, recoveryLink);

  res.json({
    success: true,
    message: "A password recovery link has been sent to your email.",
    resetTokenDev: process.env.NODE_ENV === "development" ? resetToken : undefined,
  });
});

exports.adminForgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Admin email is required." });

  const normalizedEmail = normalizeEmail(email);
  const adminUser = await User.findOne({ email: normalizedEmail, role: 'admin' });

  if (!adminUser) {
    return res.status(403).json({ 
      success: false, 
      error: "Access denied. Recovery link only available for identified administrators." 
    });
  }

  const recoveryToken = crypto.randomBytes(20).toString("hex");
  const secureHash = crypto.createHash("sha256").update(recoveryToken).digest("hex");
  
  adminUser.resetPasswordToken = secureHash;
  adminUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await adminUser.save();

  const recoveryLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${recoveryToken}`;
  await sendResetEmail(normalizedEmail, adminUser.name, recoveryLink);

  res.json({
    success: true,
    message: "Administrator recovery instructions sent.",
    resetTokenDev: process.env.NODE_ENV === "development" ? recoveryToken : undefined,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ success: false, error: "Token and new password are required." });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ success: false, error: "Recovery link is invalid or has expired." });

  // Update password and clear recovery flags
  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Your password has been reset successfully." });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const userProfile = await User.findById(req.user.id).select(
    "-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires"
  );
  
  res.json({ success: true, user: userProfile });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const profileUpdates = {};
  const { name, bio, profileImage, password } = req.body;

  if (name) profileUpdates.name = name;
  if (bio) profileUpdates.bio = bio;
  if (profileImage) profileUpdates.profileImage = profileImage;

  if (password) {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
    }
    profileUpdates.password = await bcrypt.hash(password, 12);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, 
    profileUpdates, 
    { new: true, runValidators: true }
  ).select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");

  res.json({ success: true, user: updatedUser });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Both current and new passwords are required." });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  const currentUser = await User.findById(req.user.id);
  if (!currentUser?.password) {
    return res.status(400).json({ 
      success: false, 
      error: "Google accounts must set a password via profile settings first." 
    });
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, currentUser.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ success: false, error: "The current password you entered is incorrect." });
  }

  currentUser.password = await bcrypt.hash(newPassword, 12);
  await currentUser.save();

  res.json({ success: true, message: "Password updated successfully." });
});
