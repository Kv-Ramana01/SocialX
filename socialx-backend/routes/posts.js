const express = require("express");
const router = express.Router();
const {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getUserPosts,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/", getFeed);
router.post("/", createPost);

// FIX: /user/:userId MUST come before /:id — otherwise Express matches "user" as a post id
router.get("/user/:userId", getUserPosts);

router.delete("/:id", deletePost);
router.put("/:id/like", toggleLike);
router.post("/:id/comments", addComment);

module.exports = router;