// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postsAPI, usersAPI } from "../services/api";
import "./Profile.css";

function Profile({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  const [posts,       setPosts]       = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profilePic,  setProfilePic]  = useState(
    currentUser?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Load user's own posts
  useEffect(() => {
    if (!currentUser?._id) return;
    postsAPI
      .getUserPosts(currentUser._id)
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("UserPosts error:", err))
      .finally(() => setPostsLoading(false));
  }, [currentUser]);

  // Update profilePic on avatar change
  useEffect(() => {
    if (currentUser?.profilePic) setProfilePic(currentUser.profilePic);
  }, [currentUser]);

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now use local object URL (in production upload to S3/Cloudinary)
    const imageURL = URL.createObjectURL(file);
    setProfilePic(imageURL);

    // Optionally persist as base64 (small images only)
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSaving(true);
      try {
        const data = await usersAPI.updateProfile({ profilePic: reader.result });
        setCurrentUser((prev) => ({ ...prev, profilePic: reader.result }));
        setSaveMsg("Profile picture updated!");
        setTimeout(() => setSaveMsg(""), 2500);
      } catch (err) {
        setSaveMsg("Failed to save picture.");
        setTimeout(() => setSaveMsg(""), 2500);
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7)  return `${days} days ago`;
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  };

  if (!currentUser) {
    return (
      <div className="profile-bg d-flex justify-content-center align-items-center">
        <p className="text-muted">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="profile-bg">
      {/* Cover photo */}
      <div className="cover-photo">
        <img src={currentUser.coverPic} alt="cover" className="cover-img" />
      </div>

      {/* Profile header */}
      <div className="profile-section">
        <div className="profile-pic">
          <img src={profilePic} alt="profile" />
          <input
            type="file"
            accept="image/*"
            id="profileUpload"
            onChange={handleProfileChange}
            hidden
          />
          <label htmlFor="profileUpload" className="camera-icon" title="Change photo">
            📷
          </label>
        </div>

        <div className="profile-details">
          <h2 className="profile-name">{currentUser.name || currentUser.username}</h2>
          <p className="profile-username">@{currentUser.username}</p>
          {saveMsg && (
            <p style={{ color: "#a29bfe", fontSize: 13, margin: "4px 0 0" }}>{saveMsg}</p>
          )}
          <button
            className="settings-circle-btn"
            onClick={() => navigate("/settings")}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="profile-container">
        {/* Left */}
        <div className="left-col">
          <div className="profile-card about-card">
            <h4>About</h4>
            {currentUser.about && currentUser.about.length > 0 ? (
              currentUser.about.map((line, idx) => <p key={idx}>{line}</p>)
            ) : (
              <p style={{ color: "#888", fontSize: 14 }}>No bio yet.</p>
            )}
          </div>

          <div className="profile-card friends-card">
            <h4>Friends ({currentUser.friends?.length || 0})</h4>
            <div className="friends-grid">
              {(currentUser.friends || []).slice(0, 6).map((friend) => {
                const initials = (friend.name || friend.username || "?")
                  .split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div className="friend-box" key={friend._id} title={friend.name || friend.username}>
                    {initials}
                  </div>
                );
              })}
              {(!currentUser.friends || currentUser.friends.length === 0) && (
                <p style={{ color: "#888", fontSize: 13, gridColumn: "1/-1" }}>
                  No friends yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="right-col">
          <div className="profile-card">
            <h4>Your Posts ({posts.length})</h4>

            {postsLoading && (
              <p style={{ color: "#888", fontSize: 14 }}>Loading posts…</p>
            )}

            {!postsLoading && posts.length === 0 && (
              <p style={{ color: "#888", fontSize: 14 }}>No posts yet.</p>
            )}

            <div className="profile-post-grid">
              {posts.map((post) => (
                <div className="single-post" key={post._id}>
                  <p className="post-text">{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="post" className="post-image" />
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <small style={{ color: "#a29bfe" }}>❤️ {post.likes?.length || 0}</small>
                    <small style={{ color: "#a29bfe" }}>💬 {post.comments?.length || 0}</small>
                  </div>
                  <small className="text-muted">{timeAgo(post.createdAt)}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;