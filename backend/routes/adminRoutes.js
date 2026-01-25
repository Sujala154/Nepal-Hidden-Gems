const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getPendingDestinations,
  approveDestination,
  rejectDestination,
  getAllGuides,
  getAllContributors,
  getAllTravelers,
  getStats,
  getContributorDestinations
} = require("../controllers/adminController");

// All routes require admin role
router.use(auth);
router.use(role(["admin"]));

// Dashboard & Analytics
router.get("/stats", getStats);

// Destinations moderation
router.get("/destinations/pending", getPendingDestinations);
router.put("/destinations/:id/approve", approveDestination);
router.delete("/destinations/:id/reject", rejectDestination);

// User management
router.get("/users/guides", getAllGuides);
router.get("/users/contributors", getAllContributors);
router.get("/users/travelers", getAllTravelers);
router.get("/users/:id/destinations", getContributorDestinations);

module.exports = router;
