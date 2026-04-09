// socialx-backend/middleware/privacy.js
// NEW: Privacy enforcement middleware - ALL visibility rules enforced here, not frontend
const User = require("../models/User");

/**
 * canViewPost — checks if requesting user can see a post based on:
 * - Post visibility: public / friends / private
 * - Relationship between requester and post author
 */
const canViewPost = async (requesterId, post) => {
  // Author can always see their own posts
  if (post.author._id
    ? post.author._id.toString() === requesterId.toString()
    : post.author.toString() === requesterId.toString()) {
    return true;
  }

  const visibility = post.visibility || "public";

  if (visibility === "public") return true;

  if (visibility === "private") return false;

  if (visibility === "friends") {
    // Check if requester is in author's friends list
    const authorId = post.author._id || post.author;
    const author = await User.findById(authorId).select("friends").lean();
    if (!author) return false;
    return author.friends.some(
      (fId) => fId.toString() === requesterId.toString()
    );
  }

  return false;
};

/**
 * filterPostsForUser — filters an array of posts based on privacy rules
 * Used in feed and profile endpoints
 */
const filterPostsForUser = async (posts, requesterId) => {
  const results = [];
  for (const post of posts) {
    const allowed = await canViewPost(requesterId, post);
    if (allowed) results.push(post);
  }
  return results;
};

/**
 * canViewProfile — checks if requesting user can view a profile
 * Currently allows all authenticated users to view profiles
 * (profile content filtering is done per-field)
 */
const canViewProfile = async (requesterId, targetUserId) => {
  if (requesterId.toString() === targetUserId.toString()) return true;
  // Future: add profile visibility settings here
  return true;
};

module.exports = { canViewPost, filterPostsForUser, canViewProfile };