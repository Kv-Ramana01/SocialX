// socialx-backend/controllers/notificationController.js
// NEW: Full notification CRUD
const Notification = require("../models/Notification");

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username name profilePic")
      .populate("post", "content image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    });
  } catch (error) {
    console.error("GetNotifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/notifications/read
// @desc    Mark all notifications as read
// @access  Private
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("MarkAllRead error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read
// @access  Private
const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("MarkOneRead error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    console.error("DeleteNotification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("GetUnreadCount error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  getUnreadCount,
};