// socialx-backend/routes/posts.js
// UPGRADED: Added visibility and save endpoints
const express = require("express");
const router = express.Router();
const {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getUserPosts,
  toggleSave,
  updateVisibility,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getFeed);
router.post("/", createPost);

// IMPORTANT: specific paths BEFORE /:id wildcard
router.get("/user/:userId", getUserPosts);

router.delete("/:id", deletePost);
router.put("/:id/like", toggleLike);
router.put("/:id/save", toggleSave);
router.put("/:id/visibility", updateVisibility);
router.post("/:id/comments", addComment);

module.exports = router;