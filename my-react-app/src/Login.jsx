// src/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

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
      await onLogin(email, password); // App.jsx calls authAPI.login()
      // Navigation handled by App.jsx redirect
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-dark d-flex justify-content-center align-items-center vh-100 w-100">
      <div className="card login-card shadow-lg p-4">
        <div className="card-body">

          <h2 className="text-center mb-4 text-white fw-bold">SocialX</h2>
          <h5 className="text-center text-secondary mb-4">Welcome Back</h5>

          {error && (
            <div className="alert alert-danger py-2 text-center" style={{ fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-light">Email address</label>
              <input
                type="email"
                className="form-control input-dark"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-2">
              <label className="form-label text-light">Password</label>
              <input
                type="password"
                className="form-control input-dark"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="text-end mb-3">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => navigate("/forgot")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-login w-100 py-2"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <p className="text-center text-secondary mt-3 mb-0">
            Don't have an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;