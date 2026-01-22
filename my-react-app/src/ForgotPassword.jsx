import React from "react";
import "./Login.css";

function ForgotPassword({ onBack }) {
  const handleReset = (e) => {
    e.preventDefault();
    alert("Reset link sent!");
    onBack(); // go back to login after submit
  };

  return (
    <div className="login-dark d-flex justify-content-center align-items-center vh-100 w-100">
      <div className="card login-card shadow-lg p-4">
        <div className="card-body">

          <h3 className="text-center text-white mb-3">
            Forgot Password
          </h3>

          <form onSubmit={handleReset}>
            <input
              type="email"
              className="form-control input-dark mb-3"
              placeholder="Enter your email"
              required
            />

            <button
              type="submit"
              className="btn btn-login w-100 mb-3"
            >
              Send Reset Link
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

export default ForgotPassword;
