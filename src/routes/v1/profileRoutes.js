const express = require("express");
const router = express.Router();
const controller = require("../../controllers/authController");

// Current session user info
router.get("/", controller.me);

module.exports = router;
