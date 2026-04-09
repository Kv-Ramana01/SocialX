// src/pages/Friends.jsx — Full SocialX dark theme redesign
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { friendsAPI } from "../services/api";
import "../styles/sx-theme.css";
import "./Friends.sx.css";

function Friends({ currentUser }) {
  const navigate    = useNavigate();
  const dropdownRef = useRef(null);

  const [activeSection, setActiveSection] = useState("requests");
  const [requests,      setRequests]      = useState([]);
  const [suggestions,   setSuggestions]   = useState([]);
  const [friends,       setFriends]       = useState([]);
  const [search,        setSearch]        = useState("");
  const [showSettings,  setShowSettings]  = useState(false);
  const [previewImage,  setPreviewImage]  = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    const loaders = {
      requests:    () => friendsAPI.getRequests().then((d)    => setRequests(d.requests)),
      suggestions: () => friendsAPI.getSuggestions().then((d) => setSuggestions(d.suggestions)),
      all:         () => friendsAPI.getFriends().then((d)     => setFriends(d.friends)),
      birthdays:   () => friendsAPI.getFriends().then((d)     => setFriends(d.friends)),
    };
    loaders[activeSection]?.()
      .catch((err) => console.error("Friends load error:", err))
      .finally(()  => setLoading(false));
  }, [activeSection]);

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowSettings(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && setPreviewImage(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const acceptRequest  = async (req) => {
    try {
      await friendsAPI.acceptRequest(req.from._id);
      setRequests((p) => p.filter((r) => r.from._id !== req.from._id));
      setFriends((p)  => [...p, req.from]);
    } catch (err) { alert(err.message); }
  };

  const declineRequest = async (req) => {
    try {
      await friendsAPI.declineRequest(req.from._id);
      setRequests((p) => p.filter((r) => r.from._id !== req.from._id));
    } catch (err) { alert(err.message); }
  };

  const addFriend = async (user) => {
    try {
      await friendsAPI.sendRequest(user._id);
      setSuggestions((p) => p.filter((s) => s._id !== user._id));
    } catch (err) { alert(err.message); }
  };

  const removeSuggestion = (id) => setSuggestions((p) => p.filter((s) => s._id !== id));

  const chatWithFriend = (id) => navigate("/chat", { state: { openUserId: id } });

  const getInitials = (user) => {
    const n = user?.name || user?.username || "?";
    return n.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredFriends = friends.filter((f) =>
    (f.name || f.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const todayBirthdays = friends.filter((f) => {
    if (!f.birthday) return false;
    const b = new Date(f.birthday), n = new Date();
    return b.getMonth() === n.getMonth() && b.getDate() === n.getDate();
  });

  const upcomingBirthdays = friends.filter((f) => {
    if (!f.birthday) return false;
    const b = new Date(f.birthday), n = new Date();
    const diff = (new Date(n.getFullYear(), b.getMonth(), b.getDate()) - n) / 86400000;
    return diff > 0 && diff <= 7;
  });

  const navItems = [
    { id: "requests",    label: "Friend Requests", icon: "👋", badge: requests.length },
    { id: "suggestions", label: "Suggestions",     icon: "💡" },
    { id: "all",         label: "All Friends",     icon: "👥", badge: friends.length },
    { id: "birthdays",   label: "Birthdays",       icon: "🎂" },
  ];

  return (
    <div className="fsx-root">
      {/* Nav */}
      <nav className="sx-nav fsx-nav">
        <div className="sx-nav-inner">
          <div className="sx-logo" onClick={() => navigate("/home")}>SocialX</div>
          <div className="sx-nav-links">
            <NavLink to="/home"    className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Home</NavLink>
            <NavLink to="/friends" className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Friends</NavLink>
            <NavLink to="/chat"    className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Messages</NavLink>
          </div>
          <div className="sx-nav-right">
            <div className="sx-nav-avatar" onClick={() => navigate("/profile")}>
              {currentUser?.profilePic
                ? <img src={currentUser.profilePic} alt="me" />
                : <span>{getInitials(currentUser)}</span>
              }
            </div>
            <button className="sx-logout-btn" onClick={() => navigate("/home")}>🏠 Home</button>
          </div>
        </div>
      </nav>

      <div className="fsx-layout">
        {/* Sidebar */}
        <aside className="fsx-sidebar">
          <div className="fsx-sidebar-header">
            <h3 className="fsx-sidebar-title">Friends</h3>
            <div className="fsx-settings-wrap" ref={dropdownRef}>
              <button className="fsx-settings-btn" onClick={() => setShowSettings((p) => !p)}>⚙</button>
              {showSettings && (
                <div className="fsx-settings-dropdown">
                  {[
                    { label: "Privacy Settings",       path: "/settings" },
                    { label: "Notification Settings",  path: "/settings" },
                    { label: "Blocked Users",          path: "/settings" },
                  ].map((item) => (
                    <div key={item.label} className="fsx-dropdown-item"
                      onClick={() => { navigate(item.path); setShowSettings(false); }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="fsx-sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`fsx-nav-item${activeSection === item.id ? " active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="fsx-nav-icon">{item.icon}</span>
                <span className="fsx-nav-label">{item.label}</span>
                {item.badge > 0 && <span className="sx-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="fsx-main">
          {loading ? (
            <div className="fsx-skeletons">
              {[1,2,3].map((i) => (
                <div key={i} className="fsx-skeleton-card">
                  <div className="sx-skel" style={{ width: 64, height: 64, borderRadius: "50%" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="sx-skel" style={{ width: "50%", height: 14 }} />
                    <div className="sx-skel" style={{ width: "30%", height: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Friend Requests */}
              {activeSection === "requests" && (
                <section className="sx-animate-in">
                  <h2 className="fsx-section-heading">
                    Friend Requests{requests.length > 0 && <span className="fsx-count">{requests.length}</span>}
                  </h2>
                  {requests.length === 0
                    ? <div className="sx-empty-state"><div className="sx-empty-icon">🔔</div><h4>No pending requests</h4><p>You're all caught up!</p></div>
                    : <div className="fsx-card-grid">
                        {requests.map((req) => (
                          <div className="fsx-user-card sx-animate-in" key={req.from._id}>
                            <div className="fsx-user-card-av" onClick={() => req.from.profilePic && setPreviewImage(req.from.profilePic)}>
                              {req.from.profilePic
                                ? <img src={req.from.profilePic} alt={req.from.username} />
                                : <span>{getInitials(req.from)}</span>
                              }
                            </div>
                            <h4 className="fsx-user-name">{req.from.name || req.from.username}</h4>
                            <p className="fsx-user-handle">@{req.from.username}</p>
                            <div className="fsx-user-actions">
                              <button className="sx-btn-primary fsx-btn" onClick={() => acceptRequest(req)}>Confirm</button>
                              <button className="sx-btn-secondary fsx-btn" onClick={() => declineRequest(req)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </section>
              )}

              {/* Suggestions */}
              {activeSection === "suggestions" && (
                <section className="sx-animate-in">
                  <h2 className="fsx-section-heading">People You May Know</h2>
                  {suggestions.length === 0
                    ? <div className="sx-empty-state"><div className="sx-empty-icon">💡</div><h4>No suggestions right now</h4><p>Check back later!</p></div>
                    : <div className="fsx-card-grid">
                        {suggestions.map((user) => (
                          <div className="fsx-user-card sx-animate-in" key={user._id}>
                            <div className="fsx-user-card-av" onClick={() => user.profilePic && setPreviewImage(user.profilePic)}>
                              {user.profilePic
                                ? <img src={user.profilePic} alt={user.username} />
                                : <span>{getInitials(user)}</span>
                              }
                            </div>
                            <h4 className="fsx-user-name">{user.name || user.username}</h4>
                            <p className="fsx-user-handle">@{user.username}</p>
                            <div className="fsx-user-actions">
                              <button className="sx-btn-primary fsx-btn" onClick={() => addFriend(user)}>Add Friend</button>
                              <button className="sx-btn-secondary fsx-btn" onClick={() => removeSuggestion(user._id)}>Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </section>
              )}

              {/* All Friends */}
              {activeSection === "all" && (
                <section className="sx-animate-in">
                  <h2 className="fsx-section-heading">
                    All Friends{friends.length > 0 && <span className="fsx-count">{friends.length}</span>}
                  </h2>
                  <div className="fsx-search-wrap">
                    <span className="fsx-search-icon">⌕</span>
                    <input
                      className="sx-input fsx-search"
                      placeholder="Search friends…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {filteredFriends.length === 0
                    ? <div className="sx-empty-state"><div className="sx-empty-icon">👥</div><h4>{friends.length === 0 ? "No friends yet" : "No match"}</h4><p>{friends.length === 0 ? "Go add some friends!" : "Try a different search."}</p></div>
                    : filteredFriends.map((user) => (
                        <div className="fsx-friend-row sx-animate-in" key={user._id}>
                          <div className="fsx-row-av" onClick={() => user.profilePic && setPreviewImage(user.profilePic)}>
                            {user.profilePic ? <img src={user.profilePic} alt="" /> : <span>{getInitials(user)}</span>}
                            {user.isOnline && <div className="sx-online-dot fsx-row-dot" />}
                          </div>
                          <div className="fsx-row-info">
                            <span className="fsx-row-name">{user.name || user.username}</span>
                            <span className="fsx-row-handle">@{user.username} · {user.isOnline ? "🟢 Online" : "Offline"}</span>
                          </div>
                          <div className="fsx-row-actions">
                            <button className="sx-btn-primary fsx-btn-sm" onClick={() => chatWithFriend(user._id)}>💬 Message</button>
                            <button className="sx-btn-secondary fsx-btn-sm">✓ Friends</button>
                          </div>
                        </div>
                      ))
                  }
                </section>
              )}

              {/* Birthdays */}
              {activeSection === "birthdays" && (
                <section className="sx-animate-in">
                  <h2 className="fsx-section-heading">Birthdays</h2>
                  {todayBirthdays.length > 0 && (
                    <>
                      <h3 className="fsx-sub-heading">🎉 Today</h3>
                      {todayBirthdays.map((user) => (
                        <div className="fsx-friend-row" key={user._id}>
                          <div className="fsx-row-av">
                            {user.profilePic ? <img src={user.profilePic} alt="" /> : <span>{getInitials(user)}</span>}
                          </div>
                          <div className="fsx-row-info">
                            <span className="fsx-row-name">{user.name || user.username}</span>
                            <span className="fsx-row-handle">🎂 Birthday today!</span>
                          </div>
                          <button className="sx-btn-primary fsx-btn-sm" onClick={() => chatWithFriend(user._id)}>Wish 🎂</button>
                        </div>
                      ))}
                    </>
                  )}
                  {upcomingBirthdays.length > 0 && (
                    <>
                      <h3 className="fsx-sub-heading" style={{ marginTop: 24 }}>🗓 Upcoming (next 7 days)</h3>
                      {upcomingBirthdays.map((user) => (
                        <div className="fsx-friend-row" key={user._id}>
                          <div className="fsx-row-av">
                            {user.profilePic ? <img src={user.profilePic} alt="" /> : <span>{getInitials(user)}</span>}
                          </div>
                          <div className="fsx-row-info">
                            <span className="fsx-row-name">{user.name || user.username}</span>
                            <span className="fsx-row-handle">Birthday coming up!</span>
                          </div>
                          <button className="sx-btn-secondary fsx-btn-sm">Remind Me</button>
                        </div>
                      ))}
                    </>
                  )}
                  {todayBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
                    <div className="sx-empty-state"><div className="sx-empty-icon">🎂</div><h4>No upcoming birthdays</h4><p>Enjoy the peace and quiet!</p></div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Image preview overlay */}
      {previewImage && (
        <div className="fsx-overlay" onClick={() => setPreviewImage(null)}>
          <div className="fsx-preview-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" className="fsx-preview-img" />
            <button className="fsx-preview-close" onClick={() => setPreviewImage(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;