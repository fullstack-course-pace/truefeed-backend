const express = require("express");
const router = express.Router();

const controller = require("../../controllers/aiController");

// Register new user
router.post("/ai", controller.generateAIContent);

module.exports = router;
