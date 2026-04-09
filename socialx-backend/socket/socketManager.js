// socialx-backend/socket/socketManager.js
// NEW: Real-time engine using Socket.io
// Handles: chat messages, notifications, online presence

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

// Map of userId -> socketId for online tracking
const onlineUsers = new Map();

const initSocket = (io) => {
  // ─── Auth middleware for socket connections ───
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${userId}`);

    // ─── Online presence ───
    onlineUsers.set(userId, socket.id);

    // Mark user online in DB
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Notify friends this user is online
    const user = await User.findById(userId).select("friends");
    if (user?.friends) {
      user.friends.forEach((friendId) => {
        const friendSocketId = onlineUsers.get(friendId.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit("friend_online", { userId });
        }
      });
    }

    // Send current online users to this socket
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineList);

    // ─── Join personal room for notifications ───
    socket.join(`user:${userId}`);

    // ─── Chat: send message ───
    socket.on("send_message", async ({ receiverId, text }) => {
      try {
        if (!receiverId || !text?.trim()) return;

        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          text: text.trim(),
        });

        await message.populate("sender", "username name profilePic");
        await message.populate("receiver", "username name profilePic");

        const messageData = message.toJSON();

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", messageData);
        }

        // Echo back to sender (for multi-tab support)
        socket.emit("message_sent", messageData);

        // Create notification for receiver if not online in chat
        const notification = await Notification.create({
          recipient: receiverId,
          sender: userId,
          type: "message",
          message: text.trim().slice(0, 100),
        });

        await notification.populate("sender", "username name profilePic");

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_notification", notification.toJSON());
        }
      } catch (err) {
        console.error("Socket send_message error:", err);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // ─── Chat: typing indicators ───
    socket.on("typing_start", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { userId });
      }
    });

    socket.on("typing_stop", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_stop_typing", { userId });
      }
    });

    // ─── Notifications: mark read ───
    socket.on("mark_notifications_read", async () => {
      try {
        await Notification.updateMany(
          { recipient: userId, read: false },
          { read: true }
        );
        socket.emit("notifications_cleared");
      } catch (err) {
        console.error("mark_notifications_read error:", err);
      }
    });

    // ─── Disconnect ───
    socket.on("disconnect", async () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Notify friends this user went offline
      if (user?.friends) {
        user.friends.forEach((friendId) => {
          const friendSocketId = onlineUsers.get(friendId.toString());
          if (friendSocketId) {
            io.to(friendSocketId).emit("friend_offline", { userId });
          }
        });
      }
    });
  });

  return { onlineUsers };
};

// Helper: emit notification to specific user
const emitNotificationToUser = (io, userId, notification) => {
  io.to(`user:${userId.toString()}`).emit("new_notification", notification);
};

module.exports = { initSocket, emitNotificationToUser };