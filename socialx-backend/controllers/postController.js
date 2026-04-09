// socialx-backend/controllers/postController.js
// FIXED: Privacy enforcement — friends-only posts actually filtered properly
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { emitNotificationToUser } = require("../socket/socketManager");

// ─── Helper: get friend IDs for a user ───────────────────────────────────────
const getFriendIds = async (userId) => {
  const user = await User.findById(userId).select("friends").lean();
  return (user?.friends || []).map((f) => f.toString());
};

// ─── Helper: check if a post is visible to requesterId ───────────────────────
const isPostVisible = (post, requesterId, friendIds) => {
  const authorId = (post.author?._id || post.author).toString();

  // Author always sees own posts
  if (authorId === requesterId.toString()) return true;

  const visibility = post.visibility || "public";
  if (visibility === "public")  return true;
  if (visibility === "private") return false;
  if (visibility === "friends") return friendIds.includes(authorId);

  return false;
};

// @route   GET /api/posts
// @desc    Global feed with REAL privacy filtering
const getFeed = async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || 15;
    const cursor = req.query.cursor;

    const query = {};
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    // Get friend IDs once
    const friendIds = await getFriendIds(req.user._id);
    const requesterId = req.user._id.toString();

    // Over-fetch to account for filtered posts
    const posts = await Post.find(query)
      .populate("author", "username name profilePic isOnline")
      .populate("comments.user", "username name profilePic")
      .sort({ createdAt: -1 })
      .limit(limit * 4)
      .lean();

    // Apply privacy filter
    const visiblePosts = posts.filter((post) =>
      isPostVisible(post, requesterId, friendIds)
    );

    const paginated = visiblePosts.slice(0, limit);
    const hasMore   = visiblePosts.length > limit;
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
const createPost = async (req, res) => {
  try {
    const { content, image, visibility = "public" } = req.body;

    if (!content || !content.trim())
      return res.status(400).json({ success: false, message: "Post content is required." });

    if (!["public", "friends", "private"].includes(visibility))
      return res.status(400).json({ success: false, message: "Invalid visibility setting." });

    if (image && image.length > 7 * 1024 * 1024)
      return res.status(400).json({ success: false, message: "Image too large. Please use an image under 5MB." });

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
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized." });

    await post.deleteOne();
    await Notification.deleteMany({ post: req.params.id });
    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (error) {
    console.error("DeletePost error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username name profilePic");
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    // Privacy check — can this user see this post?
    const friendIds = await getFriendIds(req.user._id);
    if (!isPostVisible(post, req.user._id, friendIds))
      return res.status(403).json({ success: false, message: "Not authorized." });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
      if (post.author._id.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.author._id,
          sender: userId,
          type: "like",
          post: post._id,
          message: "liked your post",
        });
        const io = req.app.get("io");
        if (io) {
          await notification.populate("sender", "username name profilePic");
          emitNotificationToUser(io, post.author._id, notification.toJSON());
        }
      }
    }

    await post.save();
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

    const post = await Post.findById(req.params.id).populate("author", "_id username name profilePic");
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    // Privacy check
    const friendIds = await getFriendIds(req.user._id);
    if (!isPostVisible(post, req.user._id, friendIds))
      return res.status(403).json({ success: false, message: "Not authorized." });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();
    await post.populate("comments.user", "username name profilePic");

    const newComment = post.comments[post.comments.length - 1];

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
// FIXED: Strict privacy — strangers only see public posts
const getUserPosts = async (req, res) => {
  try {
    const requesterId  = req.user._id.toString();
    const targetUserId = req.params.userId;
    const isOwnProfile = targetUserId === requesterId;

    // Get the requester's friend list to check relationship
    const friendIds = await getFriendIds(req.user._id);
    const isFriend  = friendIds.includes(targetUserId);

    // Build visibility filter — strictly enforce at DB level
    let visibilityFilter;
    if (isOwnProfile) {
      // Own profile: see everything
      visibilityFilter = { visibility: { $in: ["public", "friends", "private"] } };
    } else if (isFriend) {
      // Friend: public + friends-only
      visibilityFilter = { visibility: { $in: ["public", "friends"] } };
    } else {
      // Stranger: public only
      visibilityFilter = { visibility: "public" };
    }

    const posts = await Post.find({ author: targetUserId, ...visibilityFilter })
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
const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    const userId = req.user._id;
    const alreadySaved = post.savedBy.some((id) => id.toString() === userId.toString());

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
const updateVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;
    if (!["public", "friends", "private"].includes(visibility))
      return res.status(400).json({ success: false, message: "Invalid visibility." });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized." });

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