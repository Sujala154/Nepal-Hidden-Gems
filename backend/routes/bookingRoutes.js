const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
    createBooking, 
    getMyBookings, 
    getGuideBookings, 
    updateBookingStatus,
    respondToPartnerSuggestion,
    switchToPrivateTour,
    cancelBooking,
    requestJoinGroup,
    respondToJoinRequest,
    getPendingJoinRequests
} = require("../controllers/bookingController");

// All booking routes require authentication
router.use(auth);

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);

// Guide specific routes
router.get("/guide-bookings", getGuideBookings);
router.put("/:id/status", updateBookingStatus);

// NEW: Opt-in matchmaking routes (Admin/Guide suggests partners)
router.put("/:id/respond-to-partner", respondToPartnerSuggestion);
router.put("/:id/switch-to-private", switchToPrivateTour);
router.put("/:id/cancel", cancelBooking);

// NEW: Two-way matching routes (Traveler-to-traveler requests)
router.post("/:id/request-join-group", requestJoinGroup);
router.put("/:id/respond-to-join-request", respondToJoinRequest);
router.get("/:id/pending-requests", getPendingJoinRequests);

module.exports = router;
