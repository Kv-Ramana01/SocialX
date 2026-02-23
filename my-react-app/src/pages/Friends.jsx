
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Friends.css";


const requestsData = [
  { id: 1, name: "Emma Watson", mutuals: 5, avatar: "https://i.pravatar.cc/150?img=32" },
  { id: 2, name: "Chris Evans", mutuals: 2, avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 3, name: "Zendaya Coleman", mutuals: 6, avatar: "https://i.pravatar.cc/150?img=47" },
  { id: 4, name: "Andrew Garfield", mutuals: 3, avatar: "https://i.pravatar.cc/150?img=22" },
];

const suggestionsData = [
  { id: 5, name: "Robert Downey Jr.", mutuals: 8, avatar: "https://i.pravatar.cc/150?img=56" },
  { id: 6, name: "Scarlett Johansson", mutuals: 4, avatar: "https://i.pravatar.cc/150?img=48" },
  { id: 7, name: "Henry Cavill", mutuals: 7, avatar: "https://i.pravatar.cc/150?img=60" },
  { id: 8, name: "Gal Gadot", mutuals: 5, avatar: "https://i.pravatar.cc/150?img=44" },
  { id: 9, name: "Jason Momoa", mutuals: 6, avatar: "https://i.pravatar.cc/150?img=58" },
];

const friendsData = [
  { id: 10, name: "Mark Ruffalo", avatar: "https://i.pravatar.cc/150?img=15", birthday: "today" },
  { id: 11, name: "Tom Holland", avatar: "https://i.pravatar.cc/150?img=25", birthday: "upcoming" },
  { id: 12, name: "Benedict Cumberbatch", avatar: "https://i.pravatar.cc/150?img=33", birthday: null },
  { id: 13, name: "Chris Hemsworth", avatar: "https://i.pravatar.cc/150?img=20", birthday: null },
  { id: 14, name: "Natalie Portman", avatar: "https://i.pravatar.cc/150?img=45", birthday: "upcoming" },
  { id: 15, name: "Elizabeth Olsen", avatar: "https://i.pravatar.cc/150?img=41", birthday: null },
];

/* ------------------ COMPONENT ------------------ */

function Friends() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [activeSection, setActiveSection] = useState("requests");
  const [requests, setRequests] = useState(requestsData);
  const [suggestions, setSuggestions] = useState(suggestionsData);
  const [friends, setFriends] = useState(friendsData);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /* ------------------ ACTIONS ------------------ */

  const acceptRequest = (user) => {
    setRequests((prev) => prev.filter((r) => r.id !== user.id));
    setFriends((prev) => [...prev, { ...user, birthday: null }]);
  };

  const deleteRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const addFriend = (user) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== user.id));
    setFriends((prev) => [...prev, { ...user, birthday: null }]);
  };

  const removeSuggestion = (id) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleSettingClick = (option) => {
    alert(`${option} clicked`);
    setShowSettings(false);
  };

  const openPreview = (avatarUrl) => {
    const highRes = avatarUrl.replace(/\/\d+/, "/600");
    setPreviewImage(highRes);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const todayBirthdays = friends.filter((f) => f.birthday === "today");
  const upcomingBirthdays = friends.filter((f) => f.birthday === "upcoming");

  /* ------------------ UI ------------------ */

  return (
    <div className="friends-layout">
      {/* SIDEBAR */}
      <aside className="friends-sidebar">
        <div className="sidebar-header">
          <h3>Friends</h3>

          <div className="settings-container" ref={dropdownRef}>
            <span
              className="settings-icon"
              onClick={toggleSettings}
              title="Friends Settings"
            >
              ⚙
            </span>

            {showSettings && (
              <div className="settings-dropdown">
                <div onClick={() => handleSettingClick("Privacy Settings")}>
                  Privacy Settings
                </div>
                <div onClick={() => handleSettingClick("Notification Settings")}>
                  Notification Settings
                </div>
                <div onClick={() => handleSettingClick("Blocked Users")}>
                  Blocked Users
                </div>
                <div onClick={() => handleSettingClick("Friend Request Settings")}>
                  Friend Request Settings
                </div>
                <div onClick={() => handleSettingClick("Manage Contacts")}>
                  Manage Contacts
                </div>
              </div>
            )}
          </div>
        </div>

        <ul>
          <li className="home-item" onClick={() => navigate("/home")}>
            Home
          </li>

          <li
            className={activeSection === "requests" ? "active" : ""}
            onClick={() => setActiveSection("requests")}
          >
            Friend Requests
          </li>

          <li
            className={activeSection === "suggestions" ? "active" : ""}
            onClick={() => setActiveSection("suggestions")}
          >
            Suggestions
          </li>

          <li
            className={activeSection === "all" ? "active" : ""}
            onClick={() => setActiveSection("all")}
          >
            All Friends
          </li>

          <li
            className={activeSection === "birthdays" ? "active" : ""}
            onClick={() => setActiveSection("birthdays")}
          >
            Birthdays
          </li>
        </ul>
      </aside>

      <main className="friends-content">

        {/* REQUESTS */}
        {activeSection === "requests" && (
          <section>
            <h2>Friend Requests</h2>
            <div className="card-grid">
              {requests.map((user) => (
                <div className="friend-card" key={user.id}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="clickable-avatar"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(user.avatar);
                    }}
                  />
                  <h4>{user.name}</h4>
                  <p>{user.mutuals} mutual friends</p>
                  <button className="btn-primary" onClick={() => acceptRequest(user)}>
                    Confirm
                  </button>
                  <button className="btn-secondary" onClick={() => deleteRequest(user.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUGGESTIONS */}
        {activeSection === "suggestions" && (
          <section>
            <h2>People You May Know</h2>
            <div className="card-grid">
              {suggestions.map((user) => (
                <div className="friend-card" key={user.id}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="clickable-avatar"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(user.avatar);
                    }}
                  />
                  <h4>{user.name}</h4>
                  <p>{user.mutuals} mutual friends</p>
                  <button className="btn-primary" onClick={() => addFriend(user)}>
                    Add Friend
                  </button>
                  <button className="btn-secondary" onClick={() => removeSuggestion(user.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ALL FRIENDS */}
        {activeSection === "all" && (
          <section>
            <h2>All Friends</h2>
            <input
              className="search-input"
              placeholder="Search friends"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {filteredFriends.map((user) => (
              <div className="friend-row" key={user.id}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="clickable-avatar"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(user.avatar);
                  }}
                />
                <span>{user.name}</span>
                <button className="btn-secondary">Friends</button>
              </div>
            ))}
          </section>
        )}

        {/* BIRTHDAYS */}
        {activeSection === "birthdays" && (
          <section>
            <h2>Birthdays</h2>

            {todayBirthdays.length > 0 && (
              <>
                <h3>🎉 Today</h3>
                {todayBirthdays.map((user) => (
                  <div className="friend-row" key={user.id}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="clickable-avatar"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(user.avatar);
                      }}
                    />
                    <span>{user.name}</span>
                    <button className="btn-primary">Wish</button>
                  </div>
                ))}
              </>
            )}

            {upcomingBirthdays.length > 0 && (
              <>
                <h3 style={{ marginTop: "20px" }}>🎂 Upcoming</h3>
                {upcomingBirthdays.map((user) => (
                  <div className="friend-row" key={user.id}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="clickable-avatar"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(user.avatar);
                      }}
                    />
                    <span>{user.name}</span>
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