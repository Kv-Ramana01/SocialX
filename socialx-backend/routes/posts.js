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
router.delete("/:id", deletePost);
router.put("/:id/like", toggleLike);
router.post("/:id/comments", addComment);
router.get("/user/:userId", getUserPosts);

module.exports = router;