// src/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GalaxyCanvas from "./components/auth/GalaxyCanvas";
import "./styles/auth-galaxy.css"

function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!usernameRegex.test(username))
      return setError("Username: 3–15 chars, letters/numbers/_");
    if (!passwordRegex.test(password))
      return setError("Password needs 8+ chars, upper, lower, number & symbol.");
    setLoading(true);
    try {
      await onSignup(username, email, password);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-galaxy-bg">
        <GalaxyCanvas />
      </div>
      <div className="auth-content-layer">
        <div className="auth-glass-card">
          <div className="auth-brand">SocialX</div>
          <p className="auth-tagline">Join the universe ✨</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignup} noValidate>
            <div className="auth-input-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                className="auth-input"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Email address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Min 8 chars, upper, lower, number, symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? "Creating account…" : "Create Account"}</span>
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <button type="button" className="auth-link-btn" onClick={() => navigate("/")}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;