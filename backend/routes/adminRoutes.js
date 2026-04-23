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

const {
  getAllPayments,
  confirmRefund,
  releasePayment,
  initiateRefund
} = require("../controllers/paymentController");

// All routes require admin role
router.use(auth);
router.use(role(["admin"]));

// Dashboard & Analytics
router.get("/stats", getStats);

// Destinations moderation
router.get("/destinations/pending", getPendingDestinations);
router.put("/destinations/:id/approve", approveDestination);
router.put("/destinations/:id/reject", rejectDestination);

// User management
router.get("/users/guides", getAllGuides);
router.get("/users/contributors", getAllContributors);
router.get("/users/travelers", getAllTravelers);
router.get("/users/:id/destinations", getContributorDestinations);

// Payments & Financials
router.get("/payments", getAllPayments);
router.put("/payments/:paymentId/release", releasePayment);
router.put("/payments/:paymentId/confirm-refund", confirmRefund);
router.put("/payments/:paymentId/initiate-refund", initiateRefund);

module.exports = router;
