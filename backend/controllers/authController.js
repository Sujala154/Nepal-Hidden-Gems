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

  // Basic validation checks
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Please provide name, email, and password." });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ success: false, error: "Invalid email format." });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
  }

  // Handle roles and their specific requirements
  const validRoles = ["traveler", "contributor", "guide", "admin"];
  const assignedRole = role || "traveler";
  
  if (!validRoles.includes(assignedRole)) {
    return res.status(400).json({ success: false, error: "Assigned role is not valid." });
  }

  if (["contributor", "guide"].includes(assignedRole) && !bio) {
    return res.status(400).json({ success: false, error: `A bio is required for ${assignedRole} registrations.` });
  }

  if (assignedRole === "guide") {
    if (!specialty?.length || !languages?.length) {
      return res.status(400).json({ success: false, error: "Guides must include specialties and spoken languages." });
    }
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Contact phone number is required for guides." });
    }
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
  
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Email is already in use." });
  }

  // Setup security credentials
  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: assignedRole,
    approvalStatus: assignedRole === "guide" ? "pending" : "approved",
    verificationOTP: verificationCode,
    verificationOTPExpires: codeExpiry,
    phoneNumber,
    bio,
    specialty,
    languages,
    verification_documents: assignedRole === "guide" ? verification_documents : undefined
  });

  // Dispatch verification email
  await sendVerificationOTP(normalizedEmail, verificationCode, name);

  const successMessage = assignedRole === "guide" 
    ? "Check your email for the verification code. Once verified, your account will be reviewed by an administrator for approval."
    : "Check your email for the verification code to activate your account.";

  res.status(201).json({
    success: true,
    message: successMessage,
    user: { id: user._id, email: user.email, role: user.role, verified: user.verified },
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and code are both required." });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({
    email: normalizedEmail,
    verificationOTP: otp,
    verificationOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: "Verification code is incorrect or has expired." });
  }

  // Clear verification data on success
  user.verified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;
  await user.save();

  // Admin Approval Check for Guides - Prevent auto-login if pending
  if (user.role === "guide" && user.approvalStatus !== "approved") {
    return res.json({
      success: true,
      message: "Email verified successfully! Your account is now under administrative review. You will be able to log in once approved.",
      requiresApproval: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified }
    });
  }

  const sessionToken = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

  res.json({
    success: true,
    message: "Email verified.",
    token: sessionToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified },
  });
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Target email is required." });

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ success: false, error: "Account not found." });

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationOTP = newCode;
  user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationOTP(normalizedEmail, newCode, user.name);
  res.json({ success: true, message: "Code reshaped and sent." });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are both required." });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
  
  if (!user) return res.status(401).json({ success: false, error: "Invalid credentials." });

  if (!user.password) {
    return res.status(400).json({
      success: false,
      error: "This account is registered via Google. Please use Google Sign-in."
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, error: "Invalid credentials." });

  if (!user.verified) {
    return res.status(403).json({ success: false, error: "Account verification pending.", requiresVerification: true });
  }

  // Admin Approval Check for Guides
  if (user.role === "guide" && user.approvalStatus !== "approved") {
    if (user.approvalStatus === "pending") {
      return res.status(403).json({ 
        success: false, 
        error: "Your guide account is currently under review by the administration. You will be notified once approved." 
      });
    } else if (user.approvalStatus === "rejected") {
      return res.status(403).json({ 
        success: false, 
        error: "Your application for a guide account has been rejected. Please contact support for more details." 
      });
    }
  }

  const authToken = signToken({ userId: user._id, email: user.email, role: user.role }, "7d");

  res.json({
    success: true,
    token: authToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required for password reset." });

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ success: false, error: "Email target not found." });

  const resetToken = crypto.randomBytes(20).toString("hex");
  const secureHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  
  user.resetPasswordToken = secureHash;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const recoveryLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  await sendResetEmail(normalizedEmail, user.name, recoveryLink);

  res.json({
    success: true,
    message: "Check your email for the password recovery link."
  });
});

exports.adminForgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Admin email is required." });

  const normalizedEmail = normalizeEmail(email);
  const adminUser = await User.findOne({ email: normalizedEmail, role: 'admin' });

  if (!adminUser) {
    return res.status(403).json({ success: false, error: "Admin account not identified." });
  }

  const recoveryToken = crypto.randomBytes(20).toString("hex");
  const secureHash = crypto.createHash("sha256").update(recoveryToken).digest("hex");
  
  adminUser.resetPasswordToken = secureHash;
  adminUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await adminUser.save();

  const recoveryLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${recoveryToken}`;
  await sendResetEmail(normalizedEmail, adminUser.name, recoveryLink);

  res.json({ success: true, message: "Admin recovery link dispatched." });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ success: false, error: "Incomplete recovery request." });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ success: false, error: "Link is invalid or has timed out." });

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful." });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const userProfile = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");
  res.json({ success: true, user: userProfile });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const profileUpdates = {};
  const { name, bio, profileImage, password, specialty, languages, phoneNumber } = req.body;

  if (name) profileUpdates.name = name;
  if (bio) profileUpdates.bio = bio;
  if (profileImage) profileUpdates.profileImage = profileImage;
  if (specialty) profileUpdates.specialty = Array.isArray(specialty) ? specialty : specialty.split(',').map(s => s.trim());
  if (languages) profileUpdates.languages = Array.isArray(languages) ? languages : languages.split(',').map(l => l.trim());
  if (phoneNumber) profileUpdates.phoneNumber = phoneNumber;

  if (password) {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: "Min. 6 characters for password." });
    }
    profileUpdates.password = await bcrypt.hash(password, 12);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, profileUpdates, { new: true, runValidators: true })
    .select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");

  res.json({ success: true, user: updatedUser });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Current and new passwords must be provided." });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  const currentUser = await User.findById(req.user.id);
  if (!currentUser?.password) {
    return res.status(400).json({ success: false, error: "OAuth accounts must initialize a password in settings." });
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, currentUser.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ success: false, error: "Incorrect current password." });
  }

  currentUser.password = await bcrypt.hash(newPassword, 12);
  await currentUser.save();

  res.json({ success: true, message: "Internal password updated." });
});

