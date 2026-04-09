const express = require("express");
const router = express.Router();
const {
  getConversation,
  sendMessage,
  getChatList,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/chats", getChatList);
router.get("/:userId", getConversation);
router.post("/:userId", sendMessage);

module.exports = router;