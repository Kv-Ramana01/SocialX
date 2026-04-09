// src/pages/Settings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../services/api";
import "./Settings.css";

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
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwMsg,      setPwMsg]      = useState("");
  const [pwErr,      setPwErr]      = useState("");
  const [pwSaving,   setPwSaving]   = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "profile",       label: "👤 Profile",       keywords: "name bio birthday" },
    { id: "password",      label: "🔒 Password",      keywords: "password security change" },
    { id: "notifications", label: "🔔 Notifications", keywords: "notifications alerts" },
    { id: "privacy",       label: "🛡️ Privacy",       keywords: "privacy visibility" },
    { id: "about",         label: "ℹ️ About",          keywords: "about version" },
  ];

  const filteredTabs = tabs.filter(
    (t) => !search || t.label.toLowerCase().includes(search.toLowerCase()) || t.keywords.includes(search.toLowerCase())
  );

  const saveProfile = async () => {
    setProfileMsg(""); setProfileErr("");
    setProfileSaving(true);
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
    if (!currentPw || !newPw || !confirmPw) { setPwErr("All fields are required."); return; }
    if (newPw !== confirmPw) { setPwErr("New passwords don't match."); return; }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!regex.test(newPw)) {
      setPwErr("Password needs 8+ chars, uppercase, lowercase, number & special character.");
      return;
    }
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

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate("/profile")}>←</button>
        <h2>Settings</h2>
        <button
          onClick={() => navigate("/home")}
          style={{ marginLeft: "auto", background: "none", border: "1px solid #333", color: "#a29bfe", borderRadius: 20, padding: "4px 14px", cursor: "pointer", fontSize: 13 }}
        >
          🏠 Home
        </button>
      </div>

      {/* Search */}
      <div className="settings-search">
        <input
          type="text"
          placeholder="Search settings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Tab list */}
        <div className="settings-list" style={{ minWidth: 200, marginRight: 20 }}>
          {filteredTabs.map((t) => (
            <div
              key={t.id}
              className="settings-item"
              style={{ background: activeTab === t.id ? "#1a1a1a" : "transparent", color: activeTab === t.id ? "#a29bfe" : "#eee", borderBottom: "1px solid #222", cursor: "pointer" }}
              onClick={() => { setActiveTab(t.id); setSearch(""); }}
            >
              <span>{t.label}</span>
              <span>›</span>
            </div>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1 }}>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="settings-list" style={{ padding: 24 }}>
              <h3 style={{ color: "#a29bfe", marginBottom: 20 }}>Edit Profile</h3>

              <label style={{ color: "#ccc", fontSize: 14, display: "block", marginBottom: 6 }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />

              <label style={{ color: "#ccc", fontSize: 14, display: "block", margin: "16px 0 6px" }}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <label style={{ color: "#ccc", fontSize: 14, display: "block", margin: "16px 0 6px" }}>Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />

              {profileMsg && <p style={{ color: "#2ecc71", marginTop: 12, fontSize: 14 }}>✅ {profileMsg}</p>}
              {profileErr && <p style={{ color: "#ff5c8a", marginTop: 12, fontSize: 14 }}>❌ {profileErr}</p>}

              <button onClick={saveProfile} disabled={profileSaving} style={btnStyle}>
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="settings-list" style={{ padding: 24 }}>
              <h3 style={{ color: "#a29bfe", marginBottom: 20 }}>Change Password</h3>

              <label style={{ color: "#ccc", fontSize: 14, display: "block", marginBottom: 6 }}>Current Password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" style={inputStyle} />

              <label style={{ color: "#ccc", fontSize: 14, display: "block", margin: "16px 0 6px" }}>New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 chars, upper, lower, number, symbol" style={inputStyle} />

              <label style={{ color: "#ccc", fontSize: 14, display: "block", margin: "16px 0 6px" }}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" style={inputStyle} />

              {pwMsg && <p style={{ color: "#2ecc71", marginTop: 12, fontSize: 14 }}>✅ {pwMsg}</p>}
              {pwErr && <p style={{ color: "#ff5c8a", marginTop: 12, fontSize: 14 }}>❌ {pwErr}</p>}

              <button onClick={savePassword} disabled={pwSaving} style={btnStyle}>
                {pwSaving ? "Changing…" : "Change Password"}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="settings-list" style={{ padding: 24 }}>
              <h3 style={{ color: "#a29bfe", marginBottom: 20 }}>Notification Preferences</h3>
              {[
                ["Friend requests", true],
                ["New messages", true],
                ["Post likes", false],
                ["Comments on your posts", true],
                ["Birthday reminders", true],
              ].map(([label, def]) => (
                <NotifRow key={label} label={label} defaultVal={def} />
              ))}
              <p style={{ color: "#555", fontSize: 12, marginTop: 16 }}>
                Email notification settings coming soon.
              </p>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="settings-list" style={{ padding: 24 }}>
              <h3 style={{ color: "#a29bfe", marginBottom: 20 }}>Privacy Settings</h3>
              {[
                ["Who can see my posts", "Friends only"],
                ["Who can send me friend requests", "Everyone"],
                ["Who can message me", "Friends only"],
                ["Show my birthday", "Friends only"],
                ["Show online status", "Everyone"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #222" }}>
                  <span style={{ color: "#ccc", fontSize: 14 }}>{label}</span>
                  <select style={{ background: "#1f1f1f", border: "1px solid #333", color: "#a29bfe", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}>
                    <option>{val}</option>
                    <option>Everyone</option>
                    <option>Friends only</option>
                    <option>Only me</option>
                  </select>
                </div>
              ))}
              <p style={{ color: "#555", fontSize: 12, marginTop: 16 }}>Privacy changes take effect immediately.</p>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="settings-list" style={{ padding: 24 }}>
              <h3 style={{ color: "#a29bfe", marginBottom: 20 }}>About SocialX</h3>
              <div style={{ color: "#ccc", fontSize: 14, lineHeight: 2 }}>
                <p><strong style={{ color: "#fff" }}>Version:</strong> 1.0.0</p>
                <p><strong style={{ color: "#fff" }}>Stack:</strong> React · Node.js · Express · MongoDB</p>
                <p><strong style={{ color: "#fff" }}>Logged in as:</strong> @{currentUser?.username}</p>
                <p><strong style={{ color: "#fff" }}>Account created:</strong> {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "—"}</p>
              </div>
              <hr style={{ borderColor: "#222", margin: "20px 0" }} />
              <p style={{ color: "#888", fontSize: 13 }}>
                SocialX is a full-stack social media platform built with the MERN stack.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Small toggle component for notifications
function NotifRow({ label, defaultVal }) {
  const [on, setOn] = useState(defaultVal);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #222" }}>
      <span style={{ color: "#ccc", fontSize: 14 }}>{label}</span>
      <div
        onClick={() => setOn((p) => !p)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: "pointer", transition: "0.3s",
          background: on ? "linear-gradient(45deg,#6c5ce7,#a29bfe)" : "#333",
          position: "relative"
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, transition: "0.3s",
          left: on ? 23 : 3
        }} />
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#1f1f1f", border: "1px solid #333",
  borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14,
  outline: "none", boxSizing: "border-box"
};

const btnStyle = {
  marginTop: 20, background: "linear-gradient(45deg,#6c5ce7,#a29bfe)",
  border: "none", borderRadius: 10, padding: "10px 24px",
  color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer"
};

export default Settings;