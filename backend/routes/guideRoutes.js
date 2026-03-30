const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { getGuideById, getAllGuides, getMyEarnings } = require("../controllers/guideController");

router.get("/me/earnings", auth, role(["guide"]), getMyEarnings);
router.get("/", getAllGuides);
router.get("/:id", getGuideById);

module.exports = router;
