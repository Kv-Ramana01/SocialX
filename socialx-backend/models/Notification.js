// socialx-backend/models/Notification.js
// NEW: In-app notification system
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "like",           // someone liked your post
        "comment",        // someone commented on your post
        "friend_request", // someone sent you a friend request
        "friend_accept",  // someone accepted your friend request
        "message",        // new message (fallback for offline)
        "mention",        // mentioned in comment/post
      ],
      required: true,
    },
    // Reference to related content
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast recipient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);