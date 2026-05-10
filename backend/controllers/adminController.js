const Destination = require("../models/Destination");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all pending destinations for moderation
// @route   GET /api/admin/destinations/pending
// @access  Admin only
exports.getPendingDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ 
      $or: [
        { status: 'pending' },
        { status: 'rejected' },
        { approved: false, status: { $exists: false } } // Handle existing docs
      ]
    })
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 }); // Sort by most recent update

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    console.error("getPendingDestinations error", error);
    res.status(500).json({ success: false, error: "Failed to fetch pending destinations" });
  }
};

// @desc    Approve a destination
// @route   PUT /api/admin/destinations/:id/approve
// @access  Admin only
exports.approveDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: "Destination not found" });
    }

    destination.approved = true;
    destination.status = 'approved';
    await destination.save();

    // Trigger notification to contributor
    await createNotification({
      recipientId: destination.createdBy,
      senderId: req.user.id,
      type: 'destination_status',
      title: 'Destination Approved!',
      message: `Great news! Your destination submission "${destination.name}" has been approved and is now live.`,
      relatedId: destination._id
    });

    res.json({
      success: true,
      data: destination,
      message: "Destination approved successfully"
    });
  } catch (error) {
    console.error("approveDestination error", error);
    res.status(500).json({ success: false, error: "Failed to approve destination" });
  }
};

// @desc    Reject/Delete a destination
// @route   DELETE /api/admin/destinations/:id/reject
// @access  Admin only
exports.rejectDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: "Destination not found" });
    }

    destination.approved = false;
    destination.status = 'rejected';
    if (req.body.rejectionTitle) {
      destination.rejectionTitle = req.body.rejectionTitle;
    }
    if (req.body.rejectionReason) {
      destination.rejectionReason = req.body.rejectionReason;
    }
    await destination.save();

    // Trigger notification to contributor
    await createNotification({
      recipientId: destination.createdBy,
      senderId: req.user.id,
      type: 'destination_status',
      title: 'Destination Submission Status',
      message: `Your destination submission "${destination.name}" requires changes: ${req.body.rejectionTitle || 'Pending Review'}.`,
      relatedId: destination._id
    });

    res.json({
      success: true,
      data: destination,
      message: "Destination declined successfully"
    });
  } catch (error) {
    console.error("rejectDestination error", error);
    res.status(500).json({ success: false, error: "Failed to reject destination" });
  }
};

// @desc    Get all guides
// @route   GET /api/admin/users/guides
// @access  Admin only
exports.getAllGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: "guide" })
      .select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires")
      .sort({ createdAt: -1 });

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

// @desc    Get all contributors
// @route   GET /api/admin/users/contributors
// @access  Admin only
exports.getAllContributors = async (req, res) => {
  try {
    const contributors = await User.find({ role: "contributor" })
      .select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires")
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

// @desc    Get all travelers
// @route   GET /api/admin/users/travelers
// @access  Admin only
exports.getAllTravelers = async (req, res) => {
  try {
    const travelers = await User.find({ role: "traveler" })
      .select("-password -resetPasswordToken -resetPasswordExpires -verificationOTP -verificationOTPExpires")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: travelers.length,
      data: travelers
    });
  } catch (error) {
    console.error("getAllTravelers error", error);
    res.status(500).json({ success: false, error: "Failed to fetch travelers" });
  }
};

// @desc    Get all pending guides for approval
// @route   GET /api/admin/guides/pending
// @access  Admin only
exports.getPendingGuides = async (req, res) => {
  try {
    const pendingGuides = await User.find({ role: "guide", approvalStatus: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingGuides.length,
      data: pendingGuides
    });
  } catch (error) {
    console.error("getPendingGuides error", error);
    res.status(500).json({ success: false, error: "Failed to fetch pending guides" });
  }
};

// @desc    Approve or Reject a guide
// @route   PUT /api/admin/guides/:id/status
// @access  Admin only
exports.updateGuideStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status update" });
    }

    const guide = await User.findById(req.params.id);
    if (!guide || guide.role !== "guide") {
      return res.status(404).json({ success: false, error: "Guide not found" });
    }

    guide.approvalStatus = status;
    await guide.save();

    // Notify the guide
    await createNotification({
      recipientId: guide._id,
      senderId: req.user.id,
      type: 'account_status',
      title: status === 'approved' ? 'Guide Account Approved!' : 'Guide Account Status Update',
      message: status === 'approved' 
        ? 'Congratulations! Your guide account has been approved. You can now access your dashboard.'
        : 'Your guide application has been reviewed and unfortunately rejected at this time.',
    });

    res.json({
      success: true,
      message: `Guide ${status} successfully`,
      data: guide
    });
  } catch (error) {
    console.error("updateGuideStatus error", error);
    res.status(500).json({ success: false, error: "Failed to update guide status" });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin only
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const travelers = await User.countDocuments({ role: "traveler" });
    const contributors = await User.countDocuments({ role: "contributor" });
    const guides = await User.countDocuments({ role: "guide" });
    const verifiedGuides = await User.countDocuments({ role: "guide", verified: true });
    const pendingGuides = await User.countDocuments({ role: "guide", approvalStatus: "pending" });

    const totalDestinations = await Destination.countDocuments();
    const approvedDestinations = await Destination.countDocuments({ status: 'approved' });
    const pendingDestinations = await Destination.countDocuments({ 
      $or: [{ status: 'pending' }, { status: { $exists: false }, approved: false }] 
    });
    const rejectedDestinations = await Destination.countDocuments({ status: 'rejected' });

    // Aggregate destinations by location (top 5)
    const topLocations = await Destination.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          travelers,
          contributors,
          guides,
          verifiedGuides,
          pendingGuides
        },
        destinations: {
          total: totalDestinations,
          approved: approvedDestinations,
          pending: pendingDestinations,
          rejected: rejectedDestinations,
          topLocations
        },
        // Mock data for growth since we don't have historical tracking in models yet
        growth: [
          { month: 'Jan', users: 12 },
          { month: 'Feb', users: 19 },
          { month: 'Mar', users: 45 },
          { month: 'Apr', users: 80 }
        ]
      }
    });
  } catch (error) {
    console.error("getStats error", error);
    res.status(500).json({ success: false, error: "Failed to fetch statistics" });
  }
};

// @desc    Get destinations by contributor ID
// @route   GET /api/admin/users/:id/destinations
// @access  Admin only
exports.getContributorDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ createdBy: req.params.id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    // Also fetch user details to show name on the page
    const user = await User.findById(req.params.id).select('name email');

    res.json({
      success: true,
      count: destinations.length,
      data: destinations,
      contributor: user
    });
  } catch (error) {
    console.error("getContributorDestinations error", error);
    res.status(500).json({ success: false, error: "Failed to fetch contributor destinations" });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Admin only
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('traveler', 'name email')
      .populate('guide', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error("getAllPayments error", error);
    res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
};

// @desc    Release payout to guide
// @route   PUT /api/admin/payments/:id/release
// @access  Admin only
exports.releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    if (payment.status === 'Released') {
      return res.status(400).json({ success: false, error: "Payment already released" });
    }

    payment.status = 'Released';
    await payment.save();

    // Trigger notification to guide
    await createNotification({
      recipientId: payment.guide,
      type: 'payment',
      title: 'Payout Released!',
      message: `Your payment of NPR ${payment.amount} has been released.`,
      relatedId: payment._id
    });

    res.json({
      success: true,
      message: "Payout released successfully",
      data: payment
    });
  } catch (error) {
    console.error("releasePayment error", error);
    res.status(500).json({ success: false, error: "Failed to release payout" });
  }
};

// @desc    Toggle Ban status for a user
// @route   PUT /api/admin/users/:id/ban
// @access  Admin only
exports.toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: "Cannot modify an administrator account" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User has been successfully ${user.isBanned ? 'banned' : 'unbanned'}`,
      data: { isBanned: user.isBanned }
    });
  } catch (error) {
    console.error("toggleUserBan error", error);
    res.status(500).json({ success: false, error: "Failed to update user status" });
  }
};

// @desc    Delete a user permanently
// @route   DELETE /api/admin/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: "Cannot delete an administrator account" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User permanently deleted"
    });
  } catch (error) {
    console.error("deleteUser error", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};
