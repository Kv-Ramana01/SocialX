// src/pages/Friends.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { friendsAPI } from "../services/api";
import "./Friends.css";

function Friends({ currentUser }) {
  const navigate    = useNavigate();
  const dropdownRef = useRef(null);

  const [activeSection,  setActiveSection]  = useState("requests");
  const [requests,       setRequests]       = useState([]);
  const [suggestions,    setSuggestions]    = useState([]);
  const [friends,        setFriends]        = useState([]);
  const [search,         setSearch]         = useState("");
  const [showSettings,   setShowSettings]   = useState(false);
  const [previewImage,   setPreviewImage]   = useState(null);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    setLoading(true);
    const loaders = {
      requests:    () => friendsAPI.getRequests().then((d) => setRequests(d.requests)),
      suggestions: () => friendsAPI.getSuggestions().then((d) => setSuggestions(d.suggestions)),
      all:         () => friendsAPI.getFriends().then((d) => setFriends(d.friends)),
      birthdays:   () => friendsAPI.getFriends().then((d) => setFriends(d.friends)),
    };
    loaders[activeSection]?.()
      .catch((err) => console.error("Friends load error:", err))
      .finally(() => setLoading(false));
  }, [activeSection]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setPreviewImage(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const acceptRequest = async (req) => {
    try {
      await friendsAPI.acceptRequest(req.from._id);
      setRequests((prev) => prev.filter((r) => r.from._id !== req.from._id));
      setFriends((prev) => [...prev, req.from]);
    } catch (err) { alert(err.message); }
  };

  const declineRequest = async (req) => {
    try {
      await friendsAPI.declineRequest(req.from._id);
      setRequests((prev) => prev.filter((r) => r.from._id !== req.from._id));
    } catch (err) { alert(err.message); }
  };

  const addFriend = async (user) => {
    try {
      await friendsAPI.sendRequest(user._id);
      setSuggestions((prev) => prev.filter((s) => s._id !== user._id));
    } catch (err) { alert(err.message); }
  };

  const removeSuggestion = (userId) =>
    setSuggestions((prev) => prev.filter((s) => s._id !== userId));

  // ── NEW: go to chat with this friend ────────────────────────────────────────
  const chatWithFriend = (friendId) => {
    navigate("/chat", { state: { openUserId: friendId } });
  };

  const getInitials = (user) => {
    const name = user?.name || user?.username || "?";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredFriends = friends.filter((f) =>
    (f.name || f.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const todayBirthdays = friends.filter((f) => {
    if (!f.birthday) return false;
    const b = new Date(f.birthday);
    const n = new Date();
    return b.getMonth() === n.getMonth() && b.getDate() === n.getDate();
  });

  const upcomingBirthdays = friends.filter((f) => {
    if (!f.birthday) return false;
    const b = new Date(f.birthday);
    const n = new Date();
    const diff = (b.setFullYear(n.getFullYear()) - n) / 86400000;
    return diff > 0 && diff <= 7;
  });

  return (
    <div className="friends-layout">
      {/* Sidebar */}
      <aside className="friends-sidebar">
        <div className="sidebar-header">
          <h3>Friends</h3>
          <div className="settings-container" ref={dropdownRef}>
            <span className="settings-icon" onClick={() => setShowSettings((p) => !p)} title="Settings">⚙</span>
            {showSettings && (
              <div className="settings-dropdown">
                <div onClick={() => { navigate("/settings"); setShowSettings(false); }}>Privacy Settings</div>
                <div onClick={() => { navigate("/settings"); setShowSettings(false); }}>Notification Settings</div>
                <div onClick={() => { navigate("/settings"); setShowSettings(false); }}>Blocked Users</div>
              </div>
            )}
          </div>
        </div>
        <ul>
          <li className="home-item" onClick={() => navigate("/home")}>🏠 Home</li>
          {["requests", "suggestions", "all", "birthdays"].map((s) => (
            <li key={s} className={activeSection === s ? "active" : ""} onClick={() => setActiveSection(s)}>
              {s === "requests" ? "Friend Requests" : s === "suggestions" ? "Suggestions" : s === "all" ? "All Friends" : "Birthdays"}
            </li>
          ))}
        </ul>
      </aside>

      <main className="friends-content">
        {loading && <p style={{ color: "#aaa" }}>Loading…</p>}

        {/* Friend Requests */}
        {!loading && activeSection === "requests" && (
          <section>
            <h2>Friend Requests {requests.length > 0 && `(${requests.length})`}</h2>
            {requests.length === 0 && <p style={{ color: "#aaa" }}>No pending requests.</p>}
            <div className="card-grid">
              {requests.map((req) => (
                <div className="friend-card" key={req.from._id}>
                  <img
                    src={req.from.profilePic || `https://ui-avatars.com/api/?name=${req.from.username}&background=6c5ce7&color=fff`}
                    alt={req.from.username}
                    onClick={() => setPreviewImage(req.from.profilePic)}
                  />
                  <h4>{req.from.name || req.from.username}</h4>
                  <p>@{req.from.username}</p>
                  <button className="btn-primary" onClick={() => acceptRequest(req)}>Confirm</button>
                  <button className="btn-secondary" onClick={() => declineRequest(req)}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Suggestions */}
        {!loading && activeSection === "suggestions" && (
          <section>
            <h2>People You May Know</h2>
            {suggestions.length === 0 && <p style={{ color: "#aaa" }}>No suggestions right now.</p>}
            <div className="card-grid">
              {suggestions.map((user) => (
                <div className="friend-card" key={user._id}>
                  <img
                    src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`}
                    alt={user.username}
                    onClick={() => setPreviewImage(user.profilePic)}
                  />
                  <h4>{user.name || user.username}</h4>
                  <p>@{user.username}</p>
                  <button className="btn-primary" onClick={() => addFriend(user)}>Add Friend</button>
                  <button className="btn-secondary" onClick={() => removeSuggestion(user._id)}>Remove</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Friends — now with Message button */}
        {!loading && activeSection === "all" && (
          <section>
            <h2>All Friends ({friends.length})</h2>
            <input
              className="search-input"
              placeholder="Search friends…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredFriends.length === 0 && (
              <p style={{ color: "#aaa" }}>{friends.length === 0 ? "No friends yet." : "No friends match your search."}</p>
            )}
            {filteredFriends.map((user) => (
              <div className="friend-row" key={user._id}>
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`}
                  alt={user.username}
                  onClick={() => setPreviewImage(user.profilePic)}
                />
                <span>{user.name || user.username}</span>
                {/* NEW: Message button → opens chat with this friend */}
                <button className="btn-primary" onClick={() => chatWithFriend(user._id)}>💬 Message</button>
                <button className="btn-secondary">Friends ✓</button>
              </div>
            ))}
          </section>
        )}

        {/* Birthdays */}
        {!loading && activeSection === "birthdays" && (
          <section>
            <h2>Birthdays</h2>
            {todayBirthdays.length > 0 && (
              <>
                <h3>🎉 Today</h3>
                {todayBirthdays.map((user) => (
                  <div className="friend-row" key={user._id}>
                    <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`} alt={user.username} />
                    <span>{user.name || user.username}</span>
                    <button className="btn-primary" onClick={() => chatWithFriend(user._id)}>Wish 🎂</button>
                  </div>
                ))}
              </>
            )}
            {upcomingBirthdays.length > 0 && (
              <>
                <h3 style={{ marginTop: 20 }}>🎂 Upcoming (next 7 days)</h3>
                {upcomingBirthdays.map((user) => (
                  <div className="friend-row" key={user._id}>
                    <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`} alt={user.username} />
                    <span>{user.name || user.username}</span>
                    <button className="btn-secondary">Remind Me</button>
                  </div>
                ))}
              </>
            )}
            {todayBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
              <p style={{ color: "#aaa" }}>No upcoming birthdays 🎂</p>
            )}
          </section>
        )}
      </main>

      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-container">
            <img src={previewImage} alt="Preview" className="preview-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;