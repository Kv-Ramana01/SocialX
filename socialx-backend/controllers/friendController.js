const User = require("../models/User");

// @route   GET /api/friends/requests
// @desc    Get incoming friend requests for current user
// @access  Private
const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friendRequests.from",
      "username name profilePic"
    );

    res.status(200).json({ success: true, requests: user.friendRequests });
  } catch (error) {
    console.error("GetFriendRequests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/friends
// @desc    Get all friends of current user
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "username name profilePic isOnline lastSeen birthday"
    );

    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    console.error("GetFriends error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/friends/suggestions
// @desc    Get friend suggestions (users not yet friends, no pending request)
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const excluded = [
      req.user._id,
      ...user.friends,
      ...user.sentRequests,
      ...user.friendRequests.map((r) => r.from),
    ];

    const suggestions = await User.find({ _id: { $nin: excluded } })
      .select("username name profilePic")
      .limit(10);

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("GetSuggestions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/friends/request/:userId
// @desc    Send a friend request
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const targetId = req.params.userId;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself.",
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends.",
      });
    }

    // Check if request already sent
    const alreadySent = targetUser.friendRequests.some(
      (r) => r.from.toString() === req.user._id.toString()
    );
    if (alreadySent) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent.",
      });
    }

    // Add request to target user's friendRequests
    targetUser.friendRequests.push({ from: req.user._id });
    await targetUser.save();

    // Track sent request for current user
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { sentRequests: targetId },
    });

    res.status(200).json({ success: true, message: "Friend request sent." });
  } catch (error) {
    console.error("SendFriendRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/friends/accept/:userId
// @desc    Accept a friend request
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.userId;

    const currentUser = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if request exists
    const requestExists = currentUser.friendRequests.some(
      (r) => r.from.toString() === requesterId
    );
    if (!requestExists) {
      return res.status(400).json({
        success: false,
        message: "No friend request from this user.",
      });
    }

    // Add each other as friends
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: requesterId },
      $pull: { friendRequests: { from: requesterId } },
    });

    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { friends: req.user._id },
      $pull: { sentRequests: req.user._id },
    });

    res.status(200).json({ success: true, message: "Friend request accepted." });
  } catch (error) {
    console.error("AcceptFriendRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/friends/request/:userId
// @desc    Decline or cancel a friend request
// @access  Private
const declineFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.userId;

    // Remove from current user's incoming requests
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friendRequests: { from: requesterId } },
    });

    // Remove from requester's sentRequests
    await User.findByIdAndUpdate(requesterId, {
      $pull: { sentRequests: req.user._id },
    });

    res.status(200).json({ success: true, message: "Friend request declined." });
  } catch (error) {
    console.error("DeclineFriendRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/friends/:userId
// @desc    Remove a friend
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.userId;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user._id },
    });

    res.status(200).json({ success: true, message: "Friend removed." });
  } catch (error) {
    console.error("RemoveFriend error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getFriendRequests,
  getFriends,
  getSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
};