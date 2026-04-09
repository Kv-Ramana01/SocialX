// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postsAPI, usersAPI } from "../services/api";
import "./Profile.css";

function Profile({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  const [posts,        setPosts]        = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profilePic,   setProfilePic]   = useState(
    currentUser?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");

  useEffect(() => {
    if (!currentUser?._id) return;
    postsAPI.getUserPosts(currentUser._id)
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("UserPosts error:", err))
      .finally(() => setPostsLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.profilePic) setProfilePic(currentUser.profilePic);
  }, [currentUser]);

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageURL = URL.createObjectURL(file);
    setProfilePic(imageURL);
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSaving(true);
      try {
        await usersAPI.updateProfile({ profilePic: reader.result });
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
      {/* NEW: Top nav bar with back + settings buttons */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,13,13,0.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #222", padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <button
          onClick={() => navigate("/home")}
          style={{ background: "none", border: "1px solid #333", color: "#a29bfe", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 14 }}
        >
          ← Back to Home
        </button>
        <h5 style={{ color: "#fff", margin: 0 }}>My Profile</h5>
        <button
          onClick={() => navigate("/settings")}
          style={{ background: "linear-gradient(45deg,#6c5ce7,#a29bfe)", border: "none", color: "#fff", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 14 }}
        >
          ⚙ Settings
        </button>
      </div>

      {/* Cover photo */}
      <div className="cover-photo">
        <img src={currentUser.coverPic} alt="cover" className="cover-img" />
      </div>

      {/* Profile header */}
      <div className="profile-section">
        <div className="profile-pic">
          <img src={profilePic} alt="profile" />
          <input type="file" accept="image/*" id="profileUpload" onChange={handleProfileChange} hidden />
          <label htmlFor="profileUpload" className="camera-icon" title="Change photo">📷</label>
        </div>
        <div className="profile-details">
          <h2 className="profile-name">{currentUser.name || currentUser.username}</h2>
          <p className="profile-username">@{currentUser.username}</p>
          <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>
            {currentUser.friends?.length || 0} friends
            {currentUser.about?.length > 0 && ` · ${currentUser.about[0]}`}
          </p>
          {saveMsg && <p style={{ color: "#a29bfe", fontSize: 13, margin: "4px 0 0" }}>{saveMsg}</p>}
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
              <p style={{ color: "#888", fontSize: 14 }}>
                No bio yet.{" "}
                <span style={{ color: "#a29bfe", cursor: "pointer" }} onClick={() => navigate("/settings")}>
                  Add one in Settings →
                </span>
              </p>
            )}
          </div>

          <div className="profile-card friends-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Friends ({currentUser.friends?.length || 0})</h4>
              <span style={{ color: "#a29bfe", fontSize: 13, cursor: "pointer" }} onClick={() => navigate("/friends")}>
                See all →
              </span>
            </div>
            <div className="friends-grid">
              {(currentUser.friends || []).slice(0, 6).map((friend) => {
                const initials = (friend.name || friend.username || "?")
                  .split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div className="friend-box" key={friend._id} title={friend.name || friend.username}>
                    {friend.profilePic
                      ? <img src={friend.profilePic} alt={friend.username} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                      : initials
                    }
                  </div>
                );
              })}
              {(!currentUser.friends || currentUser.friends.length === 0) && (
                <p style={{ color: "#888", fontSize: 13, gridColumn: "1/-1" }}>
                  No friends yet.{" "}
                  <span style={{ color: "#a29bfe", cursor: "pointer" }} onClick={() => navigate("/friends")}>
                    Find people →
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — posts */}
        <div className="right-col">
          <div className="profile-card">
            <h4>Your Posts ({posts.length})</h4>
            {postsLoading && <p style={{ color: "#888", fontSize: 14 }}>Loading posts…</p>}
            {!postsLoading && posts.length === 0 && (
              <p style={{ color: "#888", fontSize: 14 }}>
                No posts yet.{" "}
                <span style={{ color: "#a29bfe", cursor: "pointer" }} onClick={() => navigate("/home")}>
                  Create one on Home →
                </span>
              </p>
            )}
            <div className="profile-post-grid">
              {posts.map((post) => (
                <div className="single-post" key={post._id}>
                  <p className="post-text">{post.content}</p>
                  {post.image && <img src={post.image} alt="post" className="post-image" />}
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