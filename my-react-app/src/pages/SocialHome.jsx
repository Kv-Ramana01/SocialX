import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../SocialHome.css";

function SocialHome({ onLogout }) {
  const navigate = useNavigate();

  /* ================= POSTS ================= */

  const [postsData, setPostsData] = useState([
    {
      id: 1,
      author: "John Doe",
      initials: "JD",
      time: "2h",
      content: "Just switched to dark mode on the new SocialX dashboard 🔥",
      likes: 12,
      liked: false,
    },
    {
      id: 2,
      author: "Jane Smith",
      initials: "JS",
      time: "5h",
      content:
        "Working on the backend connectivity today. MERN stack is fun but debugging requires patience 💻",
      likes: 8,
      liked: false,
    },
  ]);

  const [newPost, setNewPost] = useState("");

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: "KV Ramana",
      initials: "KV",
      time: "Just now",
      content: newPost,
      likes: 0,
      liked: false,
    };

    setPostsData([post, ...postsData]);
    setNewPost("");
  };

  const handleLike = (postId) => {
    setPostsData((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  /* ================= SEARCH ================= */

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const users = [
    { id: 1, name: "John Doe", initials: "JD" },
    { id: 2, name: "Jane Smith", initials: "JS" },
    { id: 3, name: "Alex Johnson", initials: "AJ" },
    { id: 4, name: "Chris Evans", initials: "CE" },
  ];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="home-bg">
      {/* ================= NAVBAR ================= */}

      <nav className="navbar-modern">
        <div className="nav-container">
          <h2 className="nav-logo">SocialX</h2>

          <div className="nav-links">
            <NavLink to="/home" className="nav-item">
              Home
            </NavLink>
            <NavLink to="/friends" className="nav-item">
              Friends
            </NavLink>
            <NavLink to="/chat" className="nav-item">
              Chat
            </NavLink>
          </div>

          <div className="search-box" ref={searchRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
            />

            {search && (
              <span className="search-clear" onClick={() => setSearch("")}>
                ✕
              </span>
            )}

            {showResults && search && (
              <div className="search-results">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="search-item">
                      <div className="search-avatar">{user.initials}</div>
                      {user.name}
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

      {/* ================= LAYOUT ================= */}

      <div className="container mt-4">
        <div className="row align-items-start">
          {/* LEFT SIDEBAR */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="side-card">
              <div className="profile-box">
                <div className="profile-avatar">KV</div>
                <h6 className="text-white mt-2">KV Ramana</h6>
                <small className="text-muted">@kvramana</small>
              </div>

              <hr />

              <div className="side-link">🏠 Home</div>
              <div className="side-link">👥 Friends</div>
              <div className="side-link">💬 Chat</div>
              <div className="side-link">⭐ Saved</div>
              <div className="side-link">⚙ Settings</div>
            </div>
          </div>

          {/* MAIN FEED */}
          <div className="col-lg-6 col-md-8 mx-auto">
            {/* CREATE POST */}
            <div className="card post-card mb-3">
              <div className="card-body">
               <div className="d-flex align-items-center mb-3 w-100">

                  <div className="profile-avatar-sm me-3">KV</div>

                  <input
  type="text"
  className="input-post form-control flex-grow-1"

                    placeholder="What's happening?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
                  />
                </div>

                <div className="text-end">
                  <button
                    className="btn btn-primary-custom"
                    onClick={handleCreatePost}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* POSTS */}
            {postsData.map((post) => (
              <div key={post.id} className="card post-card mb-4">
                <div className="card-body">
                  {/* Header */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="profile-avatar-sm me-3">
                      {post.initials}
                    </div>

                    <div className="flex-grow-1">
                      <h6 className="mb-0 text-white fw-semibold">
                        {post.author}
                      </h6>
                      <small className="text-muted">{post.time}</small>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="post-content mb-3">{post.content}</div>

                  <hr className="post-divider" />

                  {/* Actions */}
                  <div className="post-actions d-flex justify-content-between px-3">
                    <div
                      className={`action-btn ${post.liked ? "liked" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      ❤️ {post.likes}
                    </div>

                    <div className="action-btn">💬 Comment</div>

                    <div className="action-btn">🔁 Share</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="side-card">
              <h6 className="text-white mb-3">🔥 Trending</h6>
              <div className="trend-item">#ReactJS</div>
              <div className="trend-item">#MERNStack</div>
              <div className="trend-item">#WebDev</div>

              <hr />

              <h6 className="text-white mb-2">👤 Suggestions</h6>
              <div className="suggest-user">
                <div className="avatar-sm">AJ</div>
                Alex Johnson
              </div>
              <div className="suggest-user">
                <div className="avatar-sm green">JS</div>
                Jane Smith
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialHome;
