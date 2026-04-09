// src/Login.jsx
// UPGRADED: Galaxy animation, glassmorphism card, premium design
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GalaxyCanvas from "./components/auth/GalaxyCanvas";
import "../src/styles/auth-galaxy.css";

function Login({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Galaxy background */}
      <div className="auth-galaxy-bg">
        <GalaxyCanvas />
      </div>

      {/* Card layer */}
      <div className="auth-content-layer">
        <div className="auth-glass-card">
          {/* Brand */}
          <div className="auth-brand">SocialX</div>
          <p className="auth-tagline">Welcome back ✨</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} noValidate>
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="auth-forgot-link">
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => navigate("/forgot")}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? "Signing in…" : "Sign In"}</span>
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => navigate("/signup")}
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;