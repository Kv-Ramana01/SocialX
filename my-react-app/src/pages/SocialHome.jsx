// src/pages/SocialHome.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { postsAPI, usersAPI } from "../services/api";
import "../SocialHome.css";

function SocialHome({ onLogout, currentUser }) {
  const navigate = useNavigate();

  // ── Posts state ─────────────────────────────────────────────────────────────
  const [posts,      setPosts]      = useState([]);
  const [newPost,    setNewPost]    = useState("");
  const [postError,  setPostError]  = useState("");
  const [feedLoading, setFeedLoading] = useState(true);

  // ── Search state ─────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // ── Load feed on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    postsAPI
      .getFeed()
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("Feed error:", err))
      .finally(() => setFeedLoading(false));
  }, []);

  // ── Search users ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      usersAPI
        .search(search)
        .then((data) => setSearchResults(data.users))
        .catch(() => setSearchResults([]));
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [search]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Create post ──────────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPostError("");
    try {
      const data = await postsAPI.createPost(newPost.trim());
      setPosts((prev) => [data.post, ...prev]);
      setNewPost("");
    } catch (err) {
      setPostError(err.message);
    }
  };

  // ── Like / unlike ────────────────────────────────────────────────────────────
  const handleLike = useCallback(async (postId) => {
    try {
      const data = await postsAPI.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: data.post.likes, liked: data.liked }
            : p
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await onLogout();
    navigate("/");
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getInitials = (user) => {
    if (!user) return "?";
    const name = user.name || user.username || "";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLiked = (post) => {
    if (!currentUser) return false;
    return post.likes?.some(
      (id) => (typeof id === "object" ? id._id : id) === currentUser._id
    );
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const myInitials  = getInitials(currentUser);
  const myUsername  = currentUser?.username || "user";

  return (
    <div className="home-bg">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="navbar-modern">
        <div className="nav-container">
          <h2 className="nav-logo">SocialX</h2>

          <div className="nav-links">
            <NavLink to="/home"    className="nav-item">Home</NavLink>
            <NavLink to="/friends" className="nav-item">Friends</NavLink>
            <NavLink to="/chat"    className="nav-item">Chat</NavLink>
          </div>

          {/* Search */}
          <div className="search-box" ref={searchRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search users…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
            />
            {search && (
              <span className="search-clear" onClick={() => { setSearch(""); setSearchResults([]); }}>
                ✕
              </span>
            )}
            {showResults && search && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <div key={u._id} className="search-item">
                      <div className="search-avatar">{getInitials(u)}</div>
                      <div>
                        <div>{u.name || u.username}</div>
                        <small style={{ color: "#aaa" }}>@{u.username}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-item muted">No users found</div>
                )}
              </div>
            )}
          </div>

          <div className="nav-right">
            <NavLink to="/profile" className="profile-icon">
              <FaUser />
            </NavLink>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Layout ─────────────────────────────────────────────────────────── */}
      <div className="container mt-4">
        <div className="row align-items-start">

          {/* Left sidebar */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="side-card">
              <div className="text-center">
                <div className="profile-avatar">{myInitials}</div>
                <h6 className="text-white mt-2">{currentUser?.name || myUsername}</h6>
                <small className="text-muted">@{myUsername}</small>
              </div>
              <hr />
              <div className="side-link" onClick={() => navigate("/home")}>🏠 Home</div>
              <div className="side-link" onClick={() => navigate("/friends")}>👥 Friends</div>
              <div className="side-link" onClick={() => navigate("/chat")}>💬 Chat</div>
              <div className="side-link" onClick={() => navigate("/profile")}>⚙ Settings</div>
            </div>
          </div>

          {/* Feed */}
          <div className="col-lg-6 col-md-8 mx-auto">

            {/* Create post */}
            <div className="card post-card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3 w-100">
                  <div className="profile-avatar-sm me-3">{myInitials}</div>
                  <input
                    type="text"
                    className="input-post form-control flex-grow-1"
                    placeholder="What's happening?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
                  />
                </div>
                {postError && (
                  <p style={{ color: "#ff5c8a", fontSize: 13, margin: "0 0 8px" }}>
                    {postError}
                  </p>
                )}
                <div className="text-end">
                  <button className="btn btn-primary-custom" onClick={handleCreatePost}>
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            {feedLoading && (
              <p className="text-center text-muted mt-4">Loading feed…</p>
            )}

            {!feedLoading && posts.length === 0 && (
              <p className="text-center text-muted mt-4">
                No posts yet. Add friends or create your first post!
              </p>
            )}

            {posts.map((post) => {
              const author   = post.author || {};
              const liked    = isLiked(post);
              const initials = getInitials(author);

              return (
                <div key={post._id} className="card post-card mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="profile-avatar-sm me-3">{initials}</div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 text-white fw-semibold">
                          {author.name || author.username}
                        </h6>
                        <small className="text-muted">{timeAgo(post.createdAt)}</small>
                      </div>
                    </div>

                    <div className="post-content mb-3">{post.content}</div>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="post"
                        style={{ width: "100%", borderRadius: 10, marginBottom: 12 }}
                      />
                    )}

                    <hr className="post-divider" />

                    <div className="post-actions d-flex justify-content-between px-3">
                      <div
                        className={`action-btn ${liked ? "liked" : ""}`}
                        onClick={() => handleLike(post._id)}
                      >
                        ❤️ {post.likes?.length || 0}
                      </div>
                      <div className="action-btn">
                        💬 {post.comments?.length || 0}
                      </div>
                      <div className="action-btn">🔁 Share</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right sidebar */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="side-card">
              <h6 className="text-white mb-3">🔥 Trending</h6>
              <div className="trend-item">#ReactJS</div>
              <div className="trend-item">#MERNStack</div>
              <div className="trend-item">#WebDev</div>
              <hr />
              <h6 className="text-white mb-2">👤 Suggestions</h6>
              <p className="text-muted" style={{ fontSize: 13 }}>
                Add friends to see suggestions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SocialHome;