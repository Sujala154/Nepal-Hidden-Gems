const express = require("express");
const router = express.Router();
const { getGuideById, getAllGuides } = require("../controllers/guideController");

router.get("/", getAllGuides);
router.get("/:id", getGuideById);

module.exports = router;
