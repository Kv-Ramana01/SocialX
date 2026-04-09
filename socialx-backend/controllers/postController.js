const Post = require("../models/Post");
const User = require("../models/User");

// @route   GET /api/posts
// @desc    Global feed — ALL posts from ALL users (like Facebook/Twitter)
// @access  Private
const getFeed = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const posts = await Post.find({})
      .populate("author", "username name profilePic isOnline")
      .populate("comments.user", "username name profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({});

    res.status(200).json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GetFeed error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/posts
// @desc    Create a new post (supports base64 image stored in MongoDB)
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." });
    }

    if (image && image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "Image too large. Please use an image under 5MB." });
    }

    const post = await Post.create({
      author:  req.user._id,
      content: content.trim(),
      image:   image || null,
    });

    await post.populate("author", "username name profilePic");
    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("CreatePost error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized." });
    await post.deleteOne();
    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (error) {
    console.error("DeletePost error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    const userId       = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("author", "username name profilePic");
    res.status(200).json({ success: true, liked: !alreadyLiked, likeCount: post.likes.length, post });
  } catch (error) {
    console.error("ToggleLike error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/posts/:id/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ success: false, message: "Comment text is required." });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();
    await post.populate("comments.user", "username name profilePic");

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error("AddComment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/posts/user/:userId
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username name profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("GetUserPosts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getFeed, createPost, deletePost, toggleLike, addComment, getUserPosts };