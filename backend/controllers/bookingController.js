const Booking = require("../models/Booking");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { guideId, guideName, destinationName, date, amount } = req.body;

    const booking = await Booking.create({
      user: req.user.id,
      guide: guideId,
      guideName,
      destinationName,
      date,
      amount,
      status: "Unpaid",
      paymentStatus: "Unpaid"
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: "Booking initiated successfully"
    });
  } catch (error) {
    console.error("createBooking error", error);
    res.status(500).json({ success: false, error: "Failed to initiate booking" });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("guide", "name email specialty languages")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error("getMyBookings error", error);
    res.status(500).json({ success: false, error: "Failed to fetch your bookings" });
  }
};
