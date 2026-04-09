// src/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, saveToken } from "./services/api";
import "./Login.css";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation (mirrors backend rules)
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!usernameRegex.test(username)) {
      return setError("Username must be 3–15 characters: letters, numbers or _");
    }
    if (!passwordRegex.test(password)) {
      return setError(
        "Password needs 8+ chars, uppercase, lowercase, number & special character."
      );
    }

    setLoading(true);
    try {
      const data = await authAPI.register(username, email, password);
      saveToken(data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-dark d-flex justify-content-center align-items-center vh-100 w-100">
      <div className="card login-card shadow-lg p-4">
        <div className="card-body">

          <h2 className="text-center mb-2 text-white fw-bold">SocialX</h2>
          <h5 className="text-center text-secondary mb-4">Create Account</h5>

          {error && (
            <div className="alert alert-danger py-2 text-center" style={{ fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label className="form-label text-light">Username</label>
              <input
                type="text"
                className="form-control input-dark"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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

            <div className="mb-4">
              <label className="form-label text-light">Password</label>
              <input
                type="password"
                className="form-control input-dark"
                placeholder="Min 8 chars, upper, lower, number, symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-login w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-secondary mb-0">
            Already have an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate("/")}
            >
              Log in
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Signup;