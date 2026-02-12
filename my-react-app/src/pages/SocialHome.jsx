import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../SocialHome.css";

function SocialHome({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);

  // Dummy users
  const users = [
    { id: 1, name: "John Doe", initials: "JD" },
    { id: 2, name: "Jane Smith", initials: "JS" },
    { id: 3, name: "Alex Johnson", initials: "AJ" },
    { id: 4, name: "Chris Evans", initials: "CE" },
  ];

  // Dummy posts
  const posts = [
    { id: 1, content: "Just switched to dark mode on SocialX" },
    { id: 2, content: "Working on MERN stack today" },
    { id: 3, content: "React Router is finally making sense!" },
  ];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(search.toLowerCase()),
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
      {/*  NAVBAR  */}
      <nav className="navbar-modern">
        <div className="nav-container">
          {/* Logo */}
          <h2 className="nav-logo">SocialX</h2>

          {/* Tabs */}
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

          {/* Search */}
          <div className="search-box" ref={searchRef}>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search users or posts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
            />

            {/* Clear Button */}
            {search && (
              <span className="search-clear" onClick={() => setSearch("")}>
                ✕
              </span>
            )}

            {showResults && search && (
              <div className="search-results">
                {/* Users */}
                <div className="search-section">Users</div>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="search-item">
                      <div className="search-avatar">{user.initials}</div>
                      <span>{user.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-item muted">No users found</div>
                )}

                {/* Posts */}
                <div className="search-section">Posts</div>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="search-item post">
                      {post.content}
                    </div>
                  ))
                ) : (
                  <div className="search-item muted">No posts found</div>
                )}
              </div>
            )}
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ===== FEED ===== */}
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            {/* Create Post */}
            <div className="card post-card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex mb-3">
                  <div
                    className="bg-secondary rounded-circle me-3"
                    style={{ width: "45px", height: "45px" }}
                  ></div>
                  <input
                    type="text"
                    className="form-control rounded-pill input-post"
                    placeholder="What's happening?"
                  />
                </div>
                <div className="text-end">
                  <button className="btn btn-primary-custom btn-sm px-4 rounded-pill">
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Post 1 */}
            <div className="card post-card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-danger text-white rounded-circle d-flex justify-content-center align-items-center me-3"
                    style={{ width: "45px", height: "45px" }}
                  >
                    JD
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-white">John Doe</h6>
                    <small className="text-muted">@johndoe • 2h</small>
                  </div>
                </div>

                <p className="card-text text-light">
                  Just switched to dark mode on the new SocialX dashboard. It
                  looks absolutely 
                </p>

                <hr style={{ borderColor: "#333" }} />

                <div className="d-flex justify-content-around text-secondary">
                  <span className="icon-btn">Like</span>
                  <span className="icon-btn">Comment</span>
                  <span className="icon-btn">Share</span>
                </div>
              </div>
            </div>

            {/* Post 2 */}
            <div className="card post-card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-3"
                    style={{ width: "45px", height: "45px" }}
                  >
                    JS
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-white">Jane Smith</h6>
                    <small className="text-muted">@janesmith • 5h</small>
                  </div>
                </div>

                <p className="card-text text-light">
                  Working on the backend connectivity today. MERN stack is fun
                  but debugging requires patience! 
                </p>

                <hr style={{ borderColor: "#333" }} />

                <div className="d-flex justify-content-around text-secondary">
                  <span className="icon-btn">Like</span>
                  <span className="icon-btn">Comment</span>
                  <span className="icon-btn">Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialHome;
