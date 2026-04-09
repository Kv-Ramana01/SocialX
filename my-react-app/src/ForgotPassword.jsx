// src/ForgotPassword.jsx
// Improved: Galaxy animation + verify user exists → let them reset password inline
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GalaxyCanvas from "./components/auth/GalaxyCanvas";
import "../src/styles/auth-galaxy.css";

const BASE_URL = "http://localhost:5000/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("verify"); // "verify" | "reset"
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  // Step 1: verify username + email combo
  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!username.trim() || !email.trim()) return setError("Both fields are required.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");
      if (data.verified) {
        setStep("reset");
        setSuccess("Identity verified! Set your new password below.");
      } else {
        setError("No account found with that username and email.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: actually reset password
  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!newPw || !confirmPw) return setError("Please fill in both password fields.");
    if (newPw !== confirmPw) return setError("Passwords don't match.");
    if (!regex.test(newPw)) return setError("Password needs 8+ chars, upper, lower, number & symbol.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed.");
      setSuccess("Password updated! Redirecting to login…");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
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
          <p className="auth-tagline">
            {step === "verify" ? "Account Recovery 🔐" : "Set New Password 🔑"}
          </p>

          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {step === "verify" ? (
            <form onSubmit={handleVerify} noValidate>
              <div className="auth-input-group">
                <label className="auth-label">Username</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Your username"
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
                  placeholder="Email linked to your account"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? "Verifying…" : "Verify Identity"}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} noValidate>
              <div className="auth-input-group">
                <label className="auth-label">New Password</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Min 8 chars, upper, lower, number, symbol"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-input-group">
                <label className="auth-label">Confirm New Password</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Repeat new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? "Updating…" : "Update Password"}</span>
              </button>
            </form>
          )}

          <p className="auth-footer-text">
            Remember it?{" "}
            <button type="button" className="auth-link-btn" onClick={() => navigate("/")}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;