const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["traveler", "contributor", "admin", "guide"],
    default: "traveler",
  },
  verified: { type: Boolean, default: false },
  verificationOTP: { type: String }, 
  verificationOTPExpires: { type: Date },
  phoneNumber: { type: String },
  bio: { type: String },
  specialty: [String],
  languages: [String],
  experience: { type: String },
  profileImage: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);