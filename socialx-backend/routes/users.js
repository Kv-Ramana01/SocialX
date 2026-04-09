// socialx-backend/routes/users.js
// FIX: /profile and /password MUST come before /:id (otherwise Express matches "profile" as an ID)
const express = require("express");
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

// Static routes FIRST
router.get("/search", searchUsers);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

// Dynamic route LAST
router.get("/:id", getUserProfile);

module.exports = router;