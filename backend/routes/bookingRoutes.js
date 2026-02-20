const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createBooking, getMyBookings } = require("../controllers/bookingController");

// All booking routes require authentication
router.use(auth);

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);

module.exports = router;
