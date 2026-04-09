const User = require("../models/User");

// @route   GET /api/users/search?q=query
// @desc    Search users by username or name
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    })
      .select("username name profilePic isOnline")
      .limit(10);

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("SearchUsers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/users/:id
// @desc    Get a user's public profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -friendRequests -sentRequests")
      .populate("friends", "username name profilePic isOnline");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GetUserProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, about, profilePic, coverPic, birthday } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (about !== undefined) updateFields.about = about;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;
    if (coverPic !== undefined) updateFields.coverPic = coverPic;
    if (birthday !== undefined) updateFields.birthday = birthday;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("UpdateProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/users/password
// @desc    Change current user's password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("ChangePassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { searchUsers, getUserProfile, updateProfile, changePassword };