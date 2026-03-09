const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
    createBooking, 
    getMyBookings, 
    getGuideBookings, 
    updateBookingStatus 
} = require("../controllers/bookingController");

// All booking routes require authentication
router.use(auth);

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);

// Guide specific routes
router.get("/guide-bookings", getGuideBookings);
router.put("/:id/status", updateBookingStatus);

module.exports = router;
