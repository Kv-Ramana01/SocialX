// src/pages/Profile.jsx — SocialX dark theme + cover image change + improved layout
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { postsAPI, usersAPI } from "../services/api";
import "../styles/sx-theme.css";
import "./Profile.sx.css";

function Profile({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const coverInputRef   = useRef(null);
  const profileInputRef = useRef(null);

  const [posts,        setPosts]        = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState("");
  const [saveMsgType,  setSaveMsgType]  = useState("success"); // "success" | "error"
  const [activeTab,    setActiveTab]    = useState("posts");

  useEffect(() => {
    if (!currentUser?._id) return;
    postsAPI.getUserPosts(currentUser._id)
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("UserPosts error:", err))
      .finally(() => setPostsLoading(false));
  }, [currentUser?._id]);

  const showMsg = (msg, type = "success") => {
    setSaveMsg(msg); setSaveMsgType(type);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showMsg("Image must be under 5MB.", "error");
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSaving(true);
      try {
        await usersAPI.updateProfile({ profilePic: reader.result });
        setCurrentUser((prev) => ({ ...prev, profilePic: reader.result }));
        showMsg("Profile photo updated!");
      } catch {
        showMsg("Failed to save photo.", "error");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return showMsg("Cover must be under 8MB.", "error");
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSaving(true);
      try {
        await usersAPI.updateProfile({ coverPic: reader.result });
        setCurrentUser((prev) => ({ ...prev, coverPic: reader.result }));
        showMsg("Cover photo updated!");
      } catch {
        showMsg("Failed to save cover.", "error");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "Today";
    if (d === 1) return "Yesterday";
    if (d < 7)  return `${d} days ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  const getInitials = (user) => {
    const n = user?.name || user?.username || "?";
    return n.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!currentUser) {
    return (
      <div className="psx-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--sx-text3)" }}>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="psx-root">
      {/* Nav */}
      <nav className="sx-nav">
        <div className="sx-nav-inner">
          <div className="sx-logo" onClick={() => navigate("/home")}>SocialX</div>
          <div className="sx-nav-links">
            <NavLink to="/home"    className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Home</NavLink>
            <NavLink to="/friends" className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Friends</NavLink>
            <NavLink to="/chat"    className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Messages</NavLink>
          </div>
          <div className="sx-nav-right">
            <button className="sx-btn-secondary psx-nav-btn" onClick={() => navigate("/settings")}>⚙ Settings</button>
            <button className="sx-btn-secondary psx-nav-btn" onClick={() => navigate("/home")}>← Home</button>
          </div>
        </div>
      </nav>

      {/* Save message toast */}
      {saveMsg && (
        <div className={`psx-toast psx-toast-${saveMsgType}`}>
          {saveMsgType === "success" ? "✅" : "❌"} {saveMsg}
        </div>
      )}

      {/* Hero / Cover */}
      <div className="psx-hero">
        <div className="psx-cover" style={{ backgroundImage: `url(${currentUser.coverPic})` }}>
          <div className="psx-cover-overlay" />
          <button
            className="psx-cover-change-btn"
            onClick={() => coverInputRef.current?.click()}
            disabled={saving}
            title="Change cover photo"
          >
            📷 Change Cover
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverChange} />
        </div>

        {/* Profile picture */}
        <div className="psx-profile-pic-wrap">
          <div className="psx-profile-pic">
            {currentUser.profilePic
              ? <img src={currentUser.profilePic} alt="profile" />
              : <span>{getInitials(currentUser)}</span>
            }
          </div>
          <button
            className="psx-profile-pic-edit"
            onClick={() => profileInputRef.current?.click()}
            disabled={saving}
            title="Change photo"
          >
            📷
          </button>
          <input ref={profileInputRef} type="file" accept="image/*" hidden onChange={handleProfileChange} />
        </div>
      </div>

      {/* Profile info */}
      <div className="psx-identity">
        <h1 className="psx-name">{currentUser.name || currentUser.username}</h1>
        <p className="psx-handle">@{currentUser.username}</p>
        {currentUser.about?.length > 0 && (
          <p className="psx-bio">{currentUser.about.join(" · ")}</p>
        )}
        <div className="psx-stats">
          <div className="psx-stat">
            <strong>{currentUser.friends?.length || 0}</strong>
            <span>Friends</span>
          </div>
          <div className="psx-stat-divider" />
          <div className="psx-stat">
            <strong>{posts.length}</strong>
            <span>Posts</span>
          </div>
          {currentUser.birthday && (
            <>
              <div className="psx-stat-divider" />
              <div className="psx-stat">
                <strong>🎂</strong>
                <span>{new Date(currentUser.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </>
          )}
        </div>
        <div className="psx-action-row">
          <button className="sx-btn-primary" onClick={() => navigate("/settings")}>✏️ Edit Profile</button>
          <button className="sx-btn-secondary" onClick={() => navigate("/friends")}>👥 Friends</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="psx-tabs-wrap">
        <div className="psx-tabs">
          {["posts", "about", "friends"].map((tab) => (
            <button
              key={tab}
              className={`psx-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "posts" ? "📝 Posts" : tab === "about" ? "ℹ️ About" : "👥 Friends"}
            </button>
          ))}
        </div>
      </div>

      <div className="psx-body">
        {/* Posts tab */}
        {activeTab === "posts" && (
          <div className="sx-animate-in">
            {postsLoading ? (
              <div className="psx-post-grid">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="psx-post-skel">
                    <div className="sx-skel" style={{ width: "100%", height: 120, borderRadius: 10 }} />
                    <div className="sx-skel" style={{ width: "70%", height: 12, marginTop: 10 }} />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="sx-empty-state">
                <div className="sx-empty-icon">📝</div>
                <h4>No posts yet</h4>
                <p>Share something on your <span className="psx-link" onClick={() => navigate("/home")}>Home feed →</span></p>
              </div>
            ) : (
              <div className="psx-post-grid">
                {posts.map((post) => (
                  <div className="psx-post-card sx-animate-in" key={post._id}>
                    {post.image && (
                      <div className="psx-post-img-wrap">
                        <img src={post.image} alt="" className="psx-post-img" />
                      </div>
                    )}
                    <p className="psx-post-text">{post.content}</p>
                    <div className="psx-post-meta">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                      <span className="psx-post-time">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About tab */}
        {activeTab === "about" && (
          <div className="psx-about sx-animate-in">
            <div className="psx-about-card">
              <h3 className="sx-section-title">Bio</h3>
              {currentUser.about?.length > 0
                ? currentUser.about.map((line, i) => <p key={i} className="psx-about-line">{line}</p>)
                : <p className="psx-about-empty">No bio yet. <span className="psx-link" onClick={() => navigate("/settings")}>Add one in Settings →</span></p>
              }
            </div>
            <div className="psx-about-card">
              <h3 className="sx-section-title">Details</h3>
              <div className="psx-detail-row">
                <span className="psx-detail-icon">👤</span>
                <span className="psx-detail-label">Username</span>
                <span className="psx-detail-val">@{currentUser.username}</span>
              </div>
              <div className="psx-detail-row">
                <span className="psx-detail-icon">📧</span>
                <span className="psx-detail-label">Email</span>
                <span className="psx-detail-val">{currentUser.email}</span>
              </div>
              {currentUser.birthday && (
                <div className="psx-detail-row">
                  <span className="psx-detail-icon">🎂</span>
                  <span className="psx-detail-label">Birthday</span>
                  <span className="psx-detail-val">{new Date(currentUser.birthday).toLocaleDateString()}</span>
                </div>
              )}
              <div className="psx-detail-row">
                <span className="psx-detail-icon">📅</span>
                <span className="psx-detail-label">Joined</span>
                <span className="psx-detail-val">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Friends tab */}
        {activeTab === "friends" && (
          <div className="sx-animate-in">
            <div className="psx-friends-grid">
              {(currentUser.friends || []).slice(0, 12).map((friend) => {
                const initials = (friend.name || friend.username || "?")
                  .split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div className="psx-friend-box" key={friend._id}>
                    <div className="psx-friend-av">
                      {friend.profilePic
                        ? <img src={friend.profilePic} alt="" />
                        : <span>{initials}</span>
                      }
                      {friend.isOnline && <div className="psx-friend-dot" />}
                    </div>
                    <span className="psx-friend-name">{friend.name || friend.username}</span>
                  </div>
                );
              })}
              {(!currentUser.friends || currentUser.friends.length === 0) && (
                <div className="sx-empty-state" style={{ gridColumn: "1/-1" }}>
                  <div className="sx-empty-icon">👥</div>
                  <h4>No friends yet</h4>
                  <p><span className="psx-link" onClick={() => navigate("/friends")}>Find people →</span></p>
                </div>
              )}
            </div>
            {currentUser.friends?.length > 12 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button className="sx-btn-secondary" onClick={() => navigate("/friends")}>
                  See all {currentUser.friends.length} friends →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;