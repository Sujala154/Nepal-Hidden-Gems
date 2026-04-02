const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: { type: String }, // Base64 or URL for profile photo
  password: { 
    type: String, 
    required: function() {
      // Password is only required if user is not using Google OAuth
      return !this.googleId;
    }
  },
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth users
  role: {
    type: String,
    enum: ["traveler", "contributor", "guide", "admin"],
    default: "traveler",
  },
  // Fields for Contributor and Guide roles
  bio: {
    type: String,
    required: function() {
      return this.role === "contributor" || this.role === "guide";
    },
  },
  phoneNumber: {
    type: String,
    required: function() {
      return this.role === "guide";
    },
  },
  // Fields for Guide role only
  specialty: {
    type: [String],
    required: function() {
      return this.role === "guide";
    },
  },
  languages: {
    type: [String],
    required: function() {
      return this.role === "guide";
    },
  },
  verification_documents: [{
    filename: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  verified: { type: Boolean, default: false },
  verificationOTP: { type: String }, 
  verificationOTPExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  isBanned: { type: Boolean, default: false },
  banReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);