// socialx-backend/controllers/postController.js
// UPGRADED: Privacy enforcement, notifications, post visibility, save/bookmark
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { filterPostsForUser } = require("../middleware/privacy");
const { emitNotificationToUser } = require("../socket/socketManager");

// @route   GET /api/posts
// @desc    Global feed with privacy filtering + cursor-based infinite scroll
// @access  Private
const getFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const cursor = req.query.cursor; // createdAt of last post seen

    const query = {};
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Get current user's friend list for privacy filtering
    const currentUser = await User.findById(req.user._id).select("friends").lean();
    const friendIds = currentUser.friends.map((f) => f.toString());

    // Fetch posts — slightly over limit so we can filter by privacy
    // Fetch enough to account for filtered-out private/friends posts
    const posts = await Post.find(query)
      .populate("author", "username name profilePic isOnline")
      .populate("comments.user", "username name profilePic")
      .sort({ createdAt: -1 })
      .limit(limit * 3) // over-fetch, then filter
      .lean();

    // Apply privacy filtering
    const visiblePosts = posts.filter((post) => {
      const authorId = (post.author._id || post.author).toString();

      // Author sees own posts
      if (authorId === req.user._id.toString()) return true;

      const visibility = post.visibility || "public";
      if (visibility === "public") return true;
      if (visibility === "private") return false;
      if (visibility === "friends") {
        return friendIds.includes(authorId);
      }
      return false;
    });

    const paginated = visiblePosts.slice(0, limit);
    const hasMore = visiblePosts.length > limit;
    const nextCursor =
      hasMore && paginated.length > 0
        ? paginated[paginated.length - 1].createdAt.toISOString()
        : null;

    res.status(200).json({
      success: true,
      posts: paginated,
      pagination: { hasMore, nextCursor, count: paginated.length },
    });
  } catch (error) {
    console.error("GetFeed error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/posts
// @desc    Create post with visibility setting
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, image, visibility = "public" } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." });
    }

    if (!["public", "friends", "private"].includes(visibility)) {
      return res.status(400).json({ success: false, message: "Invalid visibility setting." });
    }

    if (image && image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "Image too large. Please use an image under 5MB." });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image: image || null,
      visibility,
    });

    await post.populate("author", "username name profilePic isOnline");
    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("CreatePost error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/posts/:id
// @access  Private (author only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await post.deleteOne();

    // Clean up related notifications
    await Notification.deleteMany({ post: req.params.id });

    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (error) {
    console.error("DeletePost error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username name profilePic");
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);

      // Notify post author (not if liking own post)
      if (post.author._id.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.author._id,
          sender: userId,
          type: "like",
          post: post._id,
          message: `liked your post`,
        });

        const io = req.app.get("io");
        if (io) {
          await notification.populate("sender", "username name profilePic");
          emitNotificationToUser(io, post.author._id, notification.toJSON());
        }
      }
    }

    await post.save();
    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: post.likes.length,
      post,
    });
  } catch (error) {
    console.error("ToggleLike error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }

    const post = await Post.findById(req.params.id).populate("author", "_id username name profilePic");
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();
    await post.populate("comments.user", "username name profilePic");

    const newComment = post.comments[post.comments.length - 1];

    // Notify post author (not if commenting on own post)
    if (post.author._id.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author._id,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        message: text.trim().slice(0, 100),
      });

      const io = req.app.get("io");
      if (io) {
        await notification.populate("sender", "username name profilePic");
        emitNotificationToUser(io, post.author._id, notification.toJSON());
      }
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error("AddComment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/posts/user/:userId
// @access  Private — privacy filtered
const getUserPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("friends").lean();
    const friendIds = currentUser.friends.map((f) => f.toString());
    const isOwnProfile = req.params.userId === req.user._id.toString();
    const isFriend = friendIds.includes(req.params.userId);

    // Build visibility filter based on relationship
    let visibilityFilter;
    if (isOwnProfile) {
      visibilityFilter = { visibility: { $in: ["public", "friends", "private"] } };
    } else if (isFriend) {
      visibilityFilter = { visibility: { $in: ["public", "friends"] } };
    } else {
      visibilityFilter = { visibility: "public" };
    }

    const posts = await Post.find({
      author: req.params.userId,
      ...visibilityFilter,
    })
      .populate("author", "username name profilePic isOnline")
      .populate("comments.user", "username name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("GetUserPosts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/posts/:id/save
// @desc    Toggle save/bookmark on a post
// @access  Private
const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    const userId = req.user._id;
    const alreadySaved = post.savedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      post.savedBy.push(userId);
    }

    await post.save();
    res.status(200).json({ success: true, saved: !alreadySaved });
  } catch (error) {
    console.error("ToggleSave error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/posts/:id/visibility
// @desc    Update post visibility (author only)
// @access  Private
const updateVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;
    if (!["public", "friends", "private"].includes(visibility)) {
      return res.status(400).json({ success: false, message: "Invalid visibility." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    post.visibility = visibility;
    await post.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("UpdateVisibility error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getUserPosts,
  toggleSave,
  updateVisibility,
};