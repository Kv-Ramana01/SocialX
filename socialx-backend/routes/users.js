const express = require("express");
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/search", searchUsers);
router.get("/:id", getUserProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

module.exports = router;