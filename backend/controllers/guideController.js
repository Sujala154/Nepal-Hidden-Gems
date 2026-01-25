const User = require("../models/User");

// @desc    Get guide by ID
// @route   GET /api/guides/:id
// @access  Public (or Auth depending on requirements, usually public to view profile)
exports.getGuideById = async (req, res) => {
  try {
    const guide = await User.findOne({ _id: req.params.id, role: "guide" })
      .select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");

    if (!guide) {
      return res.status(404).json({ success: false, error: "Guide not found" });
    }

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error("getGuideById error", error);
    res.status(500).json({ success: false, error: "Failed to fetch guide details" });
  }
};

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
exports.getAllGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: "guide" })
      .select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires");

    res.json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    console.error("getAllGuides error", error);
    res.status(500).json({ success: false, error: "Failed to fetch guides" });
  }
};
