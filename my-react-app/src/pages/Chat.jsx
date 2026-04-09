// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { messagesAPI } from "../services/api";
import "../SocialHome.css";

function Chat({ currentUser }) {
  const navigate   = useNavigate();
  const bottomRef  = useRef(null);

  const [chats,          setChats]          = useState([]);
  const [activeChat,     setActiveChat]     = useState(null);   // user object
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState("");
  const [chatsLoading,   setChatsLoading]   = useState(true);
  const [msgLoading,     setMsgLoading]     = useState(false);
  const [sendError,      setSendError]      = useState("");

  // Load chat list
  useEffect(() => {
    messagesAPI
      .getChatList()
      .then((data) => setChats(data.chats))
      .catch((err) => console.error("ChatList error:", err))
      .finally(() => setChatsLoading(false));
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;
    setMsgLoading(true);
    setMessages([]);
    messagesAPI
      .getConversation(activeChat._id)
      .then((data) => setMessages(data.messages))
      .catch((err) => console.error("Conversation error:", err))
      .finally(() => setMsgLoading(false));
  }, [activeChat]);

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
    } catch (err) {
      setSendError(err.message);
      setInput(tempText); // restore on error
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMine = (msg) => {
    const senderId =
      typeof msg.sender === "object" ? msg.sender._id : msg.sender;
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
            <button
              className="btn btn-outline-light btn-sm rounded-pill"
              onClick={() => navigate("/home")}
            >
              ⬅ Home
            </button>
          </div>

          {chatsLoading && (
            <p className="text-muted" style={{ fontSize: 13 }}>Loading chats…</p>
          )}

          {!chatsLoading && chats.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              No conversations yet. Add friends to start chatting!
            </p>
          )}

          {chats.map(({ user, lastMessage, unreadCount }) => (
            <div
              key={user._id}
              className={`chat-user ${activeChat?._id === user._id ? "active" : ""}`}
              onClick={() => setActiveChat(user)}
            >
              <div className={`avatar ${user.isOnline ? "green" : ""}`}>
                {getInitials(user)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {user.name || user.username}
                </p>
                <span style={{ fontSize: 12, color: "#aaa", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lastMessage ? lastMessage.text : "No messages yet"}
                </span>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {user.isOnline ? (
                  <span className="online-dot" style={{ fontSize: 11 }}>● Online</span>
                ) : (
                  <span style={{ fontSize: 11, color: "#666" }}>Offline</span>
                )}
                {unreadCount > 0 && (
                  <span
                    style={{
                      display: "block",
                      background: "#6c5ce7",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      fontSize: 11,
                      lineHeight: "18px",
                      textAlign: "center",
                      marginTop: 2,
                      marginLeft: "auto",
                    }}
                  >
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
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <p className="text-muted">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-header d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-white">
                    {activeChat.name || activeChat.username}
                  </h6>
                  <small className="text-muted">
                    {activeChat.isOnline ? "Online" : "Offline"}
                  </small>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages flex-grow-1">
                {msgLoading && (
                  <p className="text-center text-muted mt-4" style={{ fontSize: 13 }}>
                    Loading messages…
                  </p>
                )}

                {!msgLoading && messages.length === 0 && (
                  <p className="text-center text-muted mt-4" style={{ fontSize: 13 }}>
                    No messages yet. Say hello! 👋
                  </p>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message-row ${isMine(msg) ? "justify-content-end" : "justify-content-start"}`}
                  >
                    <div className={`message-bubble ${isMine(msg) ? "me" : "other"}`}>
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="chat-input flex-column">
                {sendError && (
                  <p style={{ color: "#ff5c8a", fontSize: 12, margin: "0 0 6px 0" }}>
                    {sendError}
                  </p>
                )}
                <div className="d-flex w-100">
                  <input
                    className="form-control bg-dark text-white border-0 rounded-pill"
                    placeholder="Type a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    className="btn btn-primary rounded-pill ms-2"
                    onClick={sendMessage}
                  >
                    Send
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