import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../SocialHome.css";

function SocialHome({ onLogout }) {
  const navigate = useNavigate();

  const handleCreatePost = () => {
    if (newPost.trim() === "") return;

    const post = {
      id: Date.now(), // unique id
      author: "KV Ramana",
      initials: "KV",
      time: "just now",
      content: newPost,
      likes: 0,
      liked: false,
    };

    setPostsData((prevPosts) => [post, ...prevPosts]);
    setNewPost(""); // clear input
  };

  /*POSTS STATE*/
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

  /* ===== LOGOUT ===== */
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  /* ===== LIKE HANDLER ===== */
  const handleLike = (postId) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
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

  const [newPost, setNewPost] = useState("");

  // SEARCH STATE
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  // DUMMY USERS
  const users = [
    { id: 1, name: "John Doe", initials: "JD" },
    { id: 2, name: "Jane Smith", initials: "JS" },
    { id: 3, name: "Alex Johnson", initials: "AJ" },
    { id: 4, name: "Chris Evans", initials: "CE" },
  ];
  // DUMMY POSTS
  const posts = [
    { id: 1, content: "Just switched to dark mode on SocialX 🔥" },
    { id: 2, content: "Working on MERN stack today 💻" },
    { id: 3, content: "React Router is finally making sense!" },
  ];
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(search.toLowerCase()),
  );
  // CLOSE SEARCH WHEN CLICKING OUTSIDE
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
      {/* ===== NAVBAR ===== */}
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

          {/* SEARCH */}
          <div className="search-box" ref={searchRef}>
            {" "}
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search users or posts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
            />{" "}
            {search && (
              <span className="search-clear" onClick={() => setSearch("")}>
                {" "}
                ✕{" "}
              </span>
            )}{" "}
            {showResults && search && (
              <div className="search-results">
                {" "}
                <div className="search-section">Users</div>{" "}
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="search-item">
                      {" "}
                      <div className="search-avatar">{user.initials}</div>{" "}
                      <span>{user.name}</span>{" "}
                    </div>
                  ))
                ) : (
                  <div className="search-item muted">No users found</div>
                )}{" "}
                <div className="search-section">Posts</div>{" "}
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="search-item post">
                      {" "}
                      {post.content}{" "}
                    </div>
                  ))
                ) : (
                  <div className="search-item muted">No posts found</div>
                )}{" "}
              </div>
            )}{" "}
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ===== LAYOUT ===== */}
      <div className="container mt-4">
        <div className="row">
          {/* LEFT SIDEBAR */}
          <div className="col-lg-3 d-none d-lg-block">
            {" "}
            <div className="side-card">
              {" "}
              <div className="profile-box">
                {" "}
                <div className="profile-avatar">KV</div>{" "}
                <h6 className="text-white mt-2">KV Ramana</h6>{" "}
                <small className="text">@kvramana</small>{" "}
              </div>{" "}
              <hr /> <div className="side-link">🏠 Home</div>{" "}
              <div className="side-link">👥 Friends</div>{" "}
              <div className="side-link">💬 Chat</div>{" "}
              <div className="side-link">⭐ Saved</div>{" "}
              <div className="side-link">⚙ Settings</div>{" "}
            </div>{" "}
          </div>

          {/* MAIN FEED */}

          <div className="col-lg-6 col-md-8">
            {/* CREATE POST */}
            <div className="card post-card mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="profile-avatar me-3"
                    style={{ width: "45px", height: "45px", fontSize: "14px" }}
                  >
                    KV
                  </div>

                  <input
                    type="text"
                    className="form-control input-post"
                    placeholder="What's happening?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreatePost();
                    }}
                  />
                </div>

                <div className="text-end">
                  <button
                    className="btn btn-primary-custom px-4 rounded-pill"
                    onClick={handleCreatePost}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            {postsData.map((post) => (
              <div key={post.id} className="card post-card mb-3">
                <div className="card-body">
                  <h6 className="text-white">{post.author}</h6>
                  <p className="text-light">{post.content}</p>

                  <hr />

                  <div className="post-actions d-flex justify-content-around">
                    <span
                      className={`action-btn ${post.liked ? "liked" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      ❤️ {post.likes}
                    </span>
                    <span className="action-btn">💬 Comment</span>
                    <span className="action-btn">🔁 Share</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-lg-3 d-none d-lg-block">
            {" "}
            <div className="side-card">
              {" "}
              <h6 className="text-white mb-3">🔥 Trending</h6>{" "}
              <div className="trend-item">#ReactJS</div>{" "}
              <div className="trend-item">#MERNStack</div>{" "}
              <div className="trend-item">#WebDev</div> <hr />{" "}
              <h6 className="text-white mb-2">👤 Suggestions</h6>{" "}
              <div className="suggest-user">
                {" "}
                <div className="avatar-sm">AJ</div>{" "}
                <span>Alex Johnson</span>{" "}
              </div>{" "}
              <div className="suggest-user">
                {" "}
                <div className="avatar-sm green">JS</div>{" "}
                <span>Jane Smith</span>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialHome;
