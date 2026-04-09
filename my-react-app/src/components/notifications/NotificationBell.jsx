// src/components/notifications/NotificationBell.jsx
// NEW: Real-time notification bell with dropdown panel
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../services/api";
import "./NotificationBell.css";

const ICONS = {
  like: "❤️",
  comment: "💬",
  friend_request: "👋",
  friend_accept: "🤝",
  message: "✉️",
  mention: "@",
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export default function NotificationBell({ newNotification }) {
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const panelRef = useRef(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle incoming real-time notification
  useEffect(() => {
    if (!newNotification) return;
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((c) => c + 1);
  }, [newNotification]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen((p) => !p);
    if (!open && unreadCount > 0) {
      // Mark all as read
      try {
        await notificationsAPI.markAllRead();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await notificationsAPI.markOneRead(notif._id).catch(() => {});
    }
    setOpen(false);

    // Navigate based on type
    if (notif.type === "message") {
      navigate("/chat", { state: { openUserId: notif.sender?._id } });
    } else if (notif.post) {
      navigate("/home");
    } else if (notif.type === "friend_request") {
      navigate("/friends");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationsAPI.delete(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button className="notif-bell-btn" onClick={handleOpen} aria-label="Notifications">
        <span className="notif-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <h4>Notifications</h4>
            {unreadCount === 0 && notifications.length > 0 && (
              <button
                className="notif-clear-btn"
                onClick={async () => {
                  for (const n of notifications) {
                    await notificationsAPI.delete(n._id).catch(() => {});
                  }
                  setNotifications([]);
                }}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading && (
              <div className="notif-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="notif-skeleton">
                    <div className="sk-av" />
                    <div className="sk-lines">
                      <div className="sk-line" style={{ width: "60%" }} />
                      <div className="sk-line" style={{ width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notif-empty">
                <span>🔕</span>
                <p>No notifications yet</p>
              </div>
            )}

            {!loading &&
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item ${!notif.read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-sender-av">
                    {notif.sender?.profilePic ? (
                      <img src={notif.sender.profilePic} alt="" />
                    ) : (
                      <span>
                        {(notif.sender?.name || notif.sender?.username || "?")[0].toUpperCase()}
                      </span>
                    )}
                    <span className="notif-type-icon">{ICONS[notif.type]}</span>
                  </div>

                  <div className="notif-content">
                    <p className="notif-text">
                      <strong>{notif.sender?.name || notif.sender?.username}</strong>{" "}
                      {notif.type === "like" && "liked your post"}
                      {notif.type === "comment" && `commented: "${notif.message?.slice(0, 40)}..."`}
                      {notif.type === "friend_request" && "sent you a friend request"}
                      {notif.type === "friend_accept" && "accepted your friend request"}
                      {notif.type === "message" && "sent you a message"}
                    </p>
                    <span className="notif-time">{timeAgo(notif.createdAt)}</span>
                  </div>

                  {!notif.read && <div className="notif-unread-dot" />}

                  <button
                    className="notif-delete-btn"
                    onClick={(e) => handleDelete(e, notif._id)}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}