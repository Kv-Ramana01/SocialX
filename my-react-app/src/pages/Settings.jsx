// src/pages/Settings.jsx — SocialX dark theme redesign
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { usersAPI } from "../services/api";
import "../styles/sx-theme.css";
import "./Settings.sx.css";

function Settings({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile fields
  const [name,     setName]     = useState(currentUser?.name     || "");
  const [bio,      setBio]      = useState(currentUser?.about?.[0] || "");
  const [birthday, setBirthday] = useState(
    currentUser?.birthday ? currentUser.birthday.split("T")[0] : ""
  );
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg,     setPwMsg]     = useState("");
  const [pwErr,     setPwErr]     = useState("");
  const [pwSaving,  setPwSaving]  = useState(false);

  const saveProfile = async () => {
    setProfileMsg(""); setProfileErr(""); setProfileSaving(true);
    try {
      const data = await usersAPI.updateProfile({
        name:     name.trim(),
        about:    bio.trim() ? [bio.trim()] : [],
        birthday: birthday || null,
      });
      if (setCurrentUser) setCurrentUser((prev) => ({ ...prev, ...data.user }));
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      setProfileErr(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    setPwMsg(""); setPwErr("");
    if (!currentPw || !newPw || !confirmPw) return setPwErr("All fields are required.");
    if (newPw !== confirmPw) return setPwErr("New passwords don't match.");
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!regex.test(newPw)) return setPwErr("Password needs 8+ chars, uppercase, lowercase, number & symbol.");
    setPwSaving(true);
    try {
      await usersAPI.changePassword(currentPw, newPw);
      setPwMsg("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwMsg(""), 3000);
    } catch (err) {
      setPwErr(err.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const tabs = [
    { id: "profile",       label: "Profile",       icon: "👤" },
    { id: "password",      label: "Password",      icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy",       label: "Privacy",       icon: "🛡️" },
    { id: "about",         label: "About",         icon: "ℹ️" },
  ];

  return (
    <div className="ssx-root">
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
            <button className="sx-btn-secondary ssx-nav-btn" onClick={() => navigate("/profile")}>← Profile</button>
          </div>
        </div>
      </nav>

      <div className="ssx-layout">
        {/* Sidebar */}
        <aside className="ssx-sidebar">
          <h2 className="ssx-sidebar-title">Settings</h2>
          <nav className="ssx-nav">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`ssx-nav-item${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="ssx-nav-icon">{t.icon}</span>
                <span>{t.label}</span>
                {activeTab === t.id && <span className="ssx-nav-arrow">›</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="ssx-content">

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="ssx-panel sx-animate-in">
              <h3 className="ssx-panel-title">Edit Profile</h3>

              <div className="ssx-field">
                <label className="ssx-label">Display Name</label>
                <input className="sx-input" type="text" value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>

              <div className="ssx-field">
                <label className="ssx-label">Bio</label>
                <textarea className="sx-input ssx-textarea" value={bio}
                  onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself…" rows={3} />
              </div>

              <div className="ssx-field">
                <label className="ssx-label">Birthday</label>
                <input className="sx-input ssx-date" type="date" value={birthday}
                  onChange={(e) => setBirthday(e.target.value)} style={{ colorScheme: "dark" }} />
              </div>

              {profileMsg && <p className="ssx-msg ssx-msg-success">✅ {profileMsg}</p>}
              {profileErr && <p className="ssx-msg ssx-msg-error">❌ {profileErr}</p>}

              <button className="sx-btn-primary ssx-save-btn" onClick={saveProfile} disabled={profileSaving}>
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* Password */}
          {activeTab === "password" && (
            <div className="ssx-panel sx-animate-in">
              <h3 className="ssx-panel-title">Change Password</h3>

              <div className="ssx-field">
                <label className="ssx-label">Current Password</label>
                <input className="sx-input" type="password" value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" />
              </div>

              <div className="ssx-field">
                <label className="ssx-label">New Password</label>
                <input className="sx-input" type="password" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 chars, upper, lower, number, symbol" />
              </div>

              <div className="ssx-field">
                <label className="ssx-label">Confirm New Password</label>
                <input className="sx-input" type="password" value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
              </div>

              {pwMsg && <p className="ssx-msg ssx-msg-success">✅ {pwMsg}</p>}
              {pwErr && <p className="ssx-msg ssx-msg-error">❌ {pwErr}</p>}

              <button className="sx-btn-primary ssx-save-btn" onClick={savePassword} disabled={pwSaving}>
                {pwSaving ? "Changing…" : "Change Password"}
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="ssx-panel sx-animate-in">
              <h3 className="ssx-panel-title">Notification Preferences</h3>
              {[
                ["Friend requests",       true],
                ["New messages",          true],
                ["Post likes",            false],
                ["Comments on your posts",true],
                ["Birthday reminders",    true],
              ].map(([label, def]) => (
                <NotifRow key={label} label={label} defaultVal={def} />
              ))}
              <p className="ssx-hint">Email notification settings coming soon.</p>
            </div>
          )}

          {/* Privacy */}
          {activeTab === "privacy" && (
            <div className="ssx-panel sx-animate-in">
              <h3 className="ssx-panel-title">Privacy Settings</h3>
              <div className="ssx-info-box">
                ℹ️ Post visibility is set individually when creating each post. Use the visibility toggle in the post creator on your Home feed (🌍 Public / 👥 Friends / 🔒 Only Me).
              </div>
              {[
                ["Who can send me friend requests", "Everyone"],
                ["Who can message me",              "Friends only"],
                ["Show my birthday",                "Friends only"],
                ["Show online status",              "Everyone"],
              ].map(([label, val]) => (
                <div key={label} className="ssx-privacy-row">
                  <span className="ssx-privacy-label">{label}</span>
                  <select className="ssx-privacy-select">
                    <option>{val}</option>
                    <option>Everyone</option>
                    <option>Friends only</option>
                    <option>Only me</option>
                  </select>
                </div>
              ))}
              <p className="ssx-hint">Privacy changes take effect immediately.</p>
            </div>
          )}

          {/* About */}
          {activeTab === "about" && (
            <div className="ssx-panel sx-animate-in">
              <h3 className="ssx-panel-title">About SocialX</h3>
              <div className="ssx-about-list">
                <div className="ssx-about-row"><span className="ssx-about-label">Version</span><span>1.0.0</span></div>
                <div className="ssx-about-row"><span className="ssx-about-label">Stack</span><span>React · Node.js · Express · MongoDB</span></div>
                <div className="ssx-about-row"><span className="ssx-about-label">Logged in as</span><span>@{currentUser?.username}</span></div>
                <div className="ssx-about-row"><span className="ssx-about-label">Member since</span><span>{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "—"}</span></div>
              </div>
              <div className="sx-divider" />
              <p className="ssx-hint">SocialX is a full-stack social media platform built with the MERN stack and Socket.io for real-time features.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function NotifRow({ label, defaultVal }) {
  const [on, setOn] = useState(defaultVal);
  return (
    <div className="ssx-notif-row">
      <span className="ssx-notif-label">{label}</span>
      <div className={`ssx-toggle${on ? " on" : ""}`} onClick={() => setOn((p) => !p)}>
        <div className="ssx-toggle-thumb" />
      </div>
    </div>
  );
}

export default Settings;