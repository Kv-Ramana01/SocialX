import React from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  return (
    <div className="settings-page">

      {/* Back Button */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate("/profile")}>
          ←
        </button>
        <h2>Settings</h2>
      </div>

      {/* Search */}
      <div className="settings-search">
        <input type="text" placeholder="Search settings..." />
      </div>

      {/* Settings Options */}
      <div className="settings-list">

        <div className="settings-item">
          <span>👤 Profile</span>
          <span>›</span>
        </div>

        <div className="settings-item">
          <span>🔔 Notifications</span>
          <span>›</span>
        </div>

        <div className="settings-item">
          <span>📊 Activities</span>
          <span>›</span>
        </div>

        <div className="settings-item">
          <span>🔒 Privacy</span>
          <span>›</span>
        </div>

        <div className="settings-item">
          <span>🛡 Security</span>
          <span>›</span>
        </div>

        <div className="settings-item">
          <span>ℹ About</span>
          <span>›</span>
        </div>

      </div>
    </div>
  );
}

export default Settings;