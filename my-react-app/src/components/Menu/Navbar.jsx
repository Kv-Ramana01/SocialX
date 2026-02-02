import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container">

        <span className="navbar-brand brand-text fs-3">
          SocialX
        </span>

        <div className="menu-links">
          <Link to="/home" className="menu-item">
            Home
          </Link>

          <Link to="/friends" className="menu-item">
            Friends
          </Link>

          <Link to="/chat" className="menu-item">
            Chat
          </Link>
        </div>


        <Link to="/" className="btn btn-outline-light btn-sm rounded-pill px-3">
          Log Out
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
