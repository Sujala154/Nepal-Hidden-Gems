const User = require("../models/User");

// @desc    Get all contributors
// @route   GET /api/contributors
// @access  Public
exports.getAllContributors = async (req, res) => {
  try {
    const contributors = await User.find({ role: "contributor" })
      .select("name bio profileImage verified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contributors.length,
      data: contributors
    });
  } catch (error) {
    console.error("getAllContributors error", error);
    res.status(500).json({ success: false, error: "Failed to fetch contributors" });
  }
};
