const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
      about: user.about,
      friends: user.friends,
    },
  });
};

// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ success: false, message: `${field} is already registered.` });
    }
    const user = await User.create({ username, email, password, name: name || username });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("REGISTER FULL ERROR:", error);
    res.status(500).json({ success: false, message: error.message, error });
  }
};

// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Please provide email and password." });

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/auth/logout
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: Date.now() });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends", "username name profilePic isOnline lastSeen"
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/auth/forgot-password
// FIX: Now verifies both username AND email, returns verified: true/false
const forgotPassword = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: "Username and email are required." });
    }

    const user = await User.findOne({
      username: username.trim(),
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        verified: false,
        message: "No account found with that username and email.",
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Identity verified.",
    });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/auth/reset-password
// NEW: Directly reset password after username+email verification
const resetPassword = async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;

    if (!username || !email || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters with uppercase, lowercase, number and special character.",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };