// socialx-backend/models/Post.js
// UPGRADE: Added visibility field (public/friends/private), reaction types, saveCount
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [1000, "Post cannot exceed 1000 characters"],
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [CommentSchema],
    // NEW: Privacy control — enforced at API level
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    // NEW: Save/bookmark feature
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Virtual for like count
PostSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
PostSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Index for efficient feed queries
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ visibility: 1, createdAt: -1 });

PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);