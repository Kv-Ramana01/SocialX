const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper: Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Helper: Send token response
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
// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({
        success: false,
        message: `${field} is already registered.`,
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      name: name || username,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }
    console.error("REGISTER FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user & return token
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Mark user as online
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
// @desc    Logout user (mark offline)
// @access  Private
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: Date.now(),
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "username name profilePic isOnline lastSeen",
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email (placeholder)
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // In production: generate reset token, send email
    // For now, return success message
    res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login, logout, getMe, forgotPassword };
