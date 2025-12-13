const express = require("express");
const router = express.Router();
const controller = require("../../controllers/friendsController");
const { validateBody } = require("../../middleware/validate");

// POST /api/v1/friends/request
router.post(
  "/request",
  validateBody({
    targetUserId: { type: "string", required: true, maxLen: 64 },
  }),
  controller.sendRequest
);

router.post(
  "/accept",
  validateBody({
    senderUserId: { type: "string", required: true, maxLen: 64 },
  }),
  controller.acceptRequest
);

router.get("/search", controller.searchUsers);

module.exports = router;
