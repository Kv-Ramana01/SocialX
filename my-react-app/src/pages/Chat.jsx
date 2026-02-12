import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../SocialHome.css";

function Chat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! How are you?", sender: "other", time: "14:01" },
    { id: 2, text: "I'm good, working on the project 😄", sender: "me", time: "14:02" },
    { id: 3, text: "Nice! React Router going well?", sender: "other", time: "14:03" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "me", time },
    ]);

    setInput("");
  };

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container-fluid bg-black min-vh-100 p-0">
      <div className="row g-0 min-vh-100">

        {/* Sidebar */}
        <div className="col-12 col-md-3 chat-sidebar">
          <h5 className="text-white mb-4">Chats</h5>

          <div className="chat-user active">
            <div className="avatar">JD</div>
            <div>
              <p>John Doe</p>
              <span className="online-dot">Online</span>
            </div>
          </div>

          <div className="chat-user">
            <div className="avatar green">JS</div>
            <div>
              <p>Jane Smith</p>
              <span>Last seen 1h ago</span>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-12 col-md-9 d-flex flex-column chat-window">

          {/* Header */}
          <div className="chat-header d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 text-white">John Doe</h6>
              <small className="text-muted">Online</small>
            </div>

            {/* Home Button */}
            <button
              className="btn btn-outline-light btn-sm rounded-pill"
              onClick={() => navigate("/home")}
            >
              ⬅ Home
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages flex-grow-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${
                  msg.sender === "me" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div className={`message-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              className="form-control bg-dark text-white border-0 rounded-pill"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn btn-primary rounded-pill ms-2" onClick={sendMessage}>
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Chat;
