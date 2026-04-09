// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { messagesAPI } from "../services/api";
import "../SocialHome.css";

function Chat({ currentUser }) {
  const navigate  = useNavigate();
  const location  = useLocation(); // to receive openUserId from Friends page
  const bottomRef = useRef(null);

  const [chats,        setChats]        = useState([]);
  const [activeChat,   setActiveChat]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [chatsLoading, setChatsLoading] = useState(true);
  const [msgLoading,   setMsgLoading]   = useState(false);
  const [sendError,    setSendError]    = useState("");

  // Load chat list
  useEffect(() => {
    messagesAPI
      .getChatList()
      .then((data) => {
        setChats(data.chats);

        // NEW: if navigated from Friends with a specific user, auto-open that chat
        const openUserId = location.state?.openUserId;
        if (openUserId) {
          const existing = data.chats.find((c) => c.user._id === openUserId);
          if (existing) {
            setActiveChat(existing.user);
          } else {
            // User exists but no chat history yet — fetch their profile and open
            // We'll set a minimal user object; messages will load as empty
            setActiveChat({ _id: openUserId, name: "User", username: "user", isOnline: false });
          }
        }
      })
      .catch((err) => console.error("ChatList error:", err))
      .finally(() => setChatsLoading(false));
  }, [location.state]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;
    setMsgLoading(true);
    setMessages([]);
    messagesAPI
      .getConversation(activeChat._id)
      .then((data) => {
        setMessages(data.messages);
        // If chat wasn't in list yet (new conversation), refresh chat list
        setChats((prev) => {
          const exists = prev.find((c) => c.user._id === activeChat._id);
          if (!exists) {
            messagesAPI.getChatList().then((d) => setChats(d.chats)).catch(() => {});
          }
          return prev;
        });
      })
      .catch((err) => console.error("Conversation error:", err))
      .finally(() => setMsgLoading(false));
  }, [activeChat?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    setSendError("");
    const tempText = input;
    setInput("");
    try {
      const data = await messagesAPI.sendMessage(activeChat._id, tempText);
      setMessages((prev) => [...prev, data.message]);
      // Update last message in sidebar
      setChats((prev) =>
        prev.map((c) =>
          c.user._id === activeChat._id
            ? { ...c, lastMessage: data.message }
            : c
        )
      );
    } catch (err) {
      setSendError(err.message);
      setInput(tempText);
    }
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isMine = (msg) => {
    const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    return senderId === currentUser?._id;
  };

  const getInitials = (user) => {
    if (!user) return "?";
    const name = user.name || user.username || "";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="container-fluid bg-black min-vh-100 p-0">
      <div className="row g-0 min-vh-100">

        {/* Sidebar */}
        <div className="col-12 col-md-3 chat-sidebar">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white mb-0">Chats</h5>
            <button className="btn btn-outline-light btn-sm rounded-pill" onClick={() => navigate("/home")}>
              ⬅ Home
            </button>
          </div>

          {chatsLoading && <p className="text-muted" style={{ fontSize: 13 }}>Loading chats…</p>}

          {!chatsLoading && chats.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              No conversations yet. Go to Friends and click 💬 Message!
            </p>
          )}

          {chats.map(({ user, lastMessage, unreadCount }) => (
            <div
              key={user._id}
              className={`chat-user ${activeChat?._id === user._id ? "active" : ""}`}
              onClick={() => setActiveChat(user)}
            >
              <div className={`avatar ${user.isOnline ? "green" : ""}`}>{getInitials(user)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{user.name || user.username}</p>
                <span style={{ fontSize: 12, color: "#aaa", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lastMessage ? lastMessage.text : "No messages yet"}
                </span>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {user.isOnline
                  ? <span className="online-dot" style={{ fontSize: 11 }}>● Online</span>
                  : <span style={{ fontSize: 11, color: "#666" }}>Offline</span>
                }
                {unreadCount > 0 && (
                  <span style={{ display: "block", background: "#6c5ce7", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, lineHeight: "18px", textAlign: "center", marginTop: 2, marginLeft: "auto" }}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div className="col-12 col-md-9 d-flex flex-column chat-window">
          {!activeChat ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1 flex-column gap-3">
              <p className="text-muted">Select a conversation to start chatting</p>
              <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => navigate("/friends")}>
                Go to Friends →
              </button>
            </div>
          ) : (
            <>
              <div className="chat-header d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-white">{activeChat.name || activeChat.username}</h6>
                  <small className="text-muted">{activeChat.isOnline ? "🟢 Online" : "Offline"}</small>
                </div>
              </div>

              <div className="chat-messages flex-grow-1">
                {msgLoading && <p className="text-center text-muted mt-4" style={{ fontSize: 13 }}>Loading messages…</p>}
                {!msgLoading && messages.length === 0 && (
                  <p className="text-center text-muted mt-4" style={{ fontSize: 13 }}>No messages yet. Say hello! 👋</p>
                )}
                {messages.map((msg) => (
                  <div key={msg._id} className={`message-row ${isMine(msg) ? "justify-content-end" : "justify-content-start"}`}>
                    <div className={`message-bubble ${isMine(msg) ? "me" : "other"}`}>
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="chat-input flex-column">
                {sendError && <p style={{ color: "#ff5c8a", fontSize: 12, margin: "0 0 6px 0" }}>{sendError}</p>}
                <div className="d-flex w-100">
                  <input
                    className="form-control bg-dark text-white border-0 rounded-pill"
                    placeholder="Type a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button className="btn btn-primary rounded-pill ms-2" onClick={sendMessage}>Send</button>
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