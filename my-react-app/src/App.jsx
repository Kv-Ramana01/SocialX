import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";

import SocialHome from "./pages/SocialHome";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const USER_EMAIL = "admin@gmail.com";
  const USER_PASSWORD = "12345";

  const handleLogin = (email, password) => {
    if (email === USER_EMAIL && password === USER_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <Routes>
      {/* Login */}
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

      {/* Auth */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* Protected Pages */}
      <Route
        path="/home"
        element={isLoggedIn ? <SocialHome onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/" />}
      />

      <Route
        path="/friends"
        element={isLoggedIn ? <Friends /> : <Navigate to="/" />}
      />

      <Route
        path="/chat"
        element={isLoggedIn ? <Chat /> : <Navigate to="/" />}
      />

      <Route
        path="/profile"
        element={isLoggedIn ? <Profile /> : <Navigate to="/" />}
      />

       <Route
        path="/Settings"
        element={isLoggedIn ? <Settings /> : <Navigate to="/" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
