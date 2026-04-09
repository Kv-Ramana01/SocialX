const Message = require("../models/Message");
const User = require("../models/User");

// @route   GET /api/messages/:userId
// @desc    Get conversation between current user and another user
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username name profilePic")
      .populate("receiver", "username name profilePic");

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("GetConversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/messages/:userId
// @desc    Send a message to a user
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      text: text.trim(),
    });

    await message.populate("sender", "username name profilePic");
    await message.populate("receiver", "username name profilePic");

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("SendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/messages/chats
// @desc    Get list of recent chats (one per friend)
// @access  Private
const getChatList = async (req, res) => {
  try {
    // Get all unique users current user has chatted with
    const sentMessages = await Message.distinct("receiver", {
      sender: req.user._id,
    });
    const receivedMessages = await Message.distinct("sender", {
      receiver: req.user._id,
    });

    const chatUserIds = [
      ...new Set([...sentMessages.map(String), ...receivedMessages.map(String)]),
    ];

    // Get user details + last message for each chat
    const chats = await Promise.all(
      chatUserIds.map(async (userId) => {
        const user = await User.findById(userId).select(
          "username name profilePic isOnline lastSeen"
        );

        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id },
          ],
        })
          .sort({ createdAt: -1 })
          .select("text createdAt read sender");

        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: req.user._id,
          read: false,
        });

        return { user, lastMessage, unreadCount };
      })
    );

    // Sort by last message date (newest first)
    chats.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return bTime - aTime;
    });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("GetChatList error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getConversation, sendMessage, getChatList };