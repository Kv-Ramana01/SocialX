import React, { useState } from "react";
import "./Login.css";

function Signup({ onBack }) {
  const handleSignup = (e) => {
    e.preventDefault();
    onBack(); // goes back to login after successful signup
  };

  return (
    <div className="login-dark d-flex justify-content-center align-items-center vh-100 w-100">
      <div className="card login-card shadow-lg p-4">
        <div className="card-body">

          <h3 className="text-center text-white mb-3">
            Create Account
          </h3>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              className="form-control input-dark mb-2"
              placeholder="Username"
              required
            />

            <input
              type="email"
              className="form-control input-dark mb-2"
              placeholder="Email"
              required
            />

            <input
              type="password"
              className="form-control input-dark mb-3"
              placeholder="Password"
              required
            />

            <button
              type="submit"
              className="btn btn-login w-100 mb-3"
            >
              Sign Up
            </button>
          </form>

          <button
            className="btn btn-link w-100 text-decoration-none"
            onClick={onBack}
          >
            Back to Login
          </button>

        </div>
      </div>
    </div>
  );
}

export default Signup;
