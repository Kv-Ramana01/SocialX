// socialx-backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read", markAllRead);
router.put("/:id/read", markOneRead);
router.delete("/:id", deleteNotification);

module.exports = router;