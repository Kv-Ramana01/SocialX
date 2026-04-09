// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { authAPI, saveToken, clearToken, hasToken } from "./services/api";

import Login         from "./Login";
import Signup        from "./Signup";
import ForgotPassword from "./ForgotPassword";
import SocialHome    from "./pages/SocialHome";
import Friends       from "./pages/Friends";
import Chat          from "./pages/Chat";
import Profile       from "./pages/Profile";
import Settings      from "./pages/Settings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(hasToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]   = useState(hasToken()); // only show loader if token exists

  // Re-validate token on first load
  useEffect(() => {
    if (!hasToken()) return;

    authAPI
      .getMe()
      .then((data) => {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        // Token expired / invalid
        clearToken();
        setIsLoggedIn(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (email, password) => {
    const data = await authAPI.login(email, password); // throws on error
    saveToken(data.token);
    setCurrentUser(data.user);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // ignore — always clear locally
    }
    clearToken();
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#a29bfe",
          fontSize: 20,
          fontFamily: "sans-serif",
        }}
      >
        Loading SocialX…
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/home" />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route path="/signup"  element={<Signup />} />
      <Route path="/forgot"  element={<ForgotPassword />} />

      {/* Protected */}
      <Route
        path="/home"
        element={
          isLoggedIn ? (
            <SocialHome onLogout={handleLogout} currentUser={currentUser} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/friends"
        element={isLoggedIn ? <Friends currentUser={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/chat"
        element={isLoggedIn ? <Chat currentUser={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/profile"
        element={
          isLoggedIn ? (
            <Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/settings"
        element={isLoggedIn ? <Settings currentUser={currentUser} /> : <Navigate to="/" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;