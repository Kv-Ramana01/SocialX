// src/pages/Chat.jsx — SocialX dark theme redesign
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { messagesAPI } from "../services/api";
import "../styles/sx-theme.css";
import "./Chat.sx.css";

function Chat({ currentUser }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const [chats,        setChats]        = useState([]);
  const [activeChat,   setActiveChat]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [chatsLoading, setChatsLoading] = useState(true);
  const [msgLoading,   setMsgLoading]   = useState(false);
  const [sendError,    setSendError]    = useState("");

  useEffect(() => {
    messagesAPI.getChatList()
      .then((data) => {
        setChats(data.chats);
        const openUserId = location.state?.openUserId;
        if (openUserId) {
          const existing = data.chats.find((c) => c.user._id === openUserId);
          if (existing) {
            setActiveChat(existing.user);
          } else {
            setActiveChat({ _id: openUserId, name: "User", username: "user", isOnline: false });
          }
        }
      })
      .catch((err) => console.error("ChatList error:", err))
      .finally(() => setChatsLoading(false));
  }, [location.state]);

  useEffect(() => {
    if (!activeChat) return;
    setMsgLoading(true); setMessages([]);
    messagesAPI.getConversation(activeChat._id)
      .then((data) => {
        setMessages(data.messages);
        setChats((prev) => {
          const exists = prev.find((c) => c.user._id === activeChat._id);
          if (!exists) messagesAPI.getChatList().then((d) => setChats(d.chats)).catch(() => {});
          return prev;
        });
      })
      .catch((err) => console.error("Conversation error:", err))
      .finally(() => setMsgLoading(false));
  }, [activeChat?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    setSendError(""); const tempText = input; setInput("");
    try {
      const data = await messagesAPI.sendMessage(activeChat._id, tempText);
      setMessages((prev) => [...prev, data.message]);
      setChats((prev) => prev.map((c) =>
        c.user._id === activeChat._id ? { ...c, lastMessage: data.message } : c
      ));
    } catch (err) {
      setSendError(err.message); setInput(tempText);
    }
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isMine = (msg) => {
    const sid = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    return sid === currentUser?._id;
  };

  const getInitials = (user) => {
    if (!user) return "?";
    return (user.name || user.username || "?").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="csx-root">
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
            <div className="sx-nav-avatar" onClick={() => navigate("/profile")}>
              {currentUser?.profilePic ? <img src={currentUser.profilePic} alt="me" /> : <span>{getInitials(currentUser)}</span>}
            </div>
          </div>
        </div>
      </nav>

      <div className="csx-layout">
        {/* Sidebar */}
        <aside className="csx-sidebar">
          <div className="csx-sidebar-head">
            <h3 className="csx-sidebar-title">Messages</h3>
            <span className="csx-chat-count">{chats.length}</span>
          </div>

          {chatsLoading && (
            <div style={{ padding: "12px 0" }}>
              {[1,2,3].map((i) => (
                <div key={i} className="csx-chat-skel">
                  <div className="sx-skel" style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="sx-skel" style={{ width: "60%", height: 13 }} />
                    <div className="sx-skel" style={{ width: "40%", height: 11 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!chatsLoading && chats.length === 0 && (
            <div className="sx-empty-state" style={{ padding: "32px 12px" }}>
              <div className="sx-empty-icon">💬</div>
              <h4>No conversations</h4>
              <p>Go to Friends to start chatting!</p>
            </div>
          )}

          {chats.map(({ user, lastMessage, unreadCount }) => (
            <div
              key={user._id}
              className={`csx-chat-item${activeChat?._id === user._id ? " active" : ""}`}
              onClick={() => setActiveChat(user)}
            >
              <div className="csx-chat-av">
                {user.profilePic ? <img src={user.profilePic} alt="" /> : <span>{getInitials(user)}</span>}
                {user.isOnline && <div className="csx-online-pip" />}
              </div>
              <div className="csx-chat-info">
                <div className="csx-chat-name">{user.name || user.username}</div>
                <div className="csx-chat-preview">
                  {lastMessage ? lastMessage.text : "Start a conversation…"}
                </div>
              </div>
              <div className="csx-chat-meta">
                {user.isOnline
                  ? <span className="csx-online-label">Online</span>
                  : <span className="csx-offline-label">Offline</span>
                }
                {unreadCount > 0 && <span className="sx-badge csx-unread">{unreadCount}</span>}
              </div>
            </div>
          ))}
        </aside>

        {/* Chat window */}
        <div className="csx-window">
          {!activeChat ? (
            <div className="csx-empty-window">
              <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
              <h3>Select a conversation</h3>
              <p>Pick a chat from the left or go to Friends to start a new one.</p>
              <button className="sx-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/friends")}>
                Go to Friends →
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="csx-window-head">
                <div className="csx-window-av">
                  {activeChat.profilePic ? <img src={activeChat.profilePic} alt="" /> : <span>{getInitials(activeChat)}</span>}
                  {activeChat.isOnline && <div className="csx-online-pip" />}
                </div>
                <div>
                  <div className="csx-window-name">{activeChat.name || activeChat.username}</div>
                  <div className="csx-window-status">
                    {activeChat.isOnline ? "🟢 Active now" : "⚫ Offline"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="csx-messages">
                {msgLoading && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--sx-text3)", fontSize: 13 }}>
                    Loading messages…
                  </div>
                )}
                {!msgLoading && messages.length === 0 && (
                  <div className="sx-empty-state" style={{ paddingTop: 60 }}>
                    <div className="sx-empty-icon">👋</div>
                    <h4>Start the conversation</h4>
                    <p>Say hello to {activeChat.name || activeChat.username}!</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg._id} className={`csx-msg-row ${isMine(msg) ? "mine" : "theirs"}`}>
                    {!isMine(msg) && (
                      <div className="csx-msg-av">
                        {activeChat.profilePic ? <img src={activeChat.profilePic} alt="" /> : <span>{getInitials(activeChat)}</span>}
                      </div>
                    )}
                    <div className={`csx-bubble ${isMine(msg) ? "mine" : "theirs"}`}>
                      <p className="csx-bubble-text">{msg.text}</p>
                      <span className="csx-bubble-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="csx-input-area">
                {sendError && (
                  <div style={{ color: "var(--sx-red)", fontSize: 12, marginBottom: 6 }}>{sendError}</div>
                )}
                <div className="csx-input-row">
                  <button className="csx-attach-btn" title="Attach (coming soon)">📎</button>
                  <input
                    ref={inputRef}
                    className="csx-input"
                    placeholder={`Message ${activeChat.name || activeChat.username}…`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  />
                  <button
                    className="csx-send-btn"
                    onClick={sendMessage}
                    disabled={!input.trim()}
                  >
                    ↑
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;