const express = require("express");
const router = express.Router();
const { getAllContributors } = require("../controllers/contributorController");

// Public route to get all contributors
router.get("/", getAllContributors);

module.exports = router;
