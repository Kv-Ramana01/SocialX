// import React, { useState } from "react";
// import "./Login.css";

// function Signup({ onBack }) {

//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignup = (e) => {
//     e.preventDefault();

//     const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const passwordRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;


//     // Username check
//     if (!usernameRegex.test(username)) {
//       alert(
//         "Username must be 3-15 characters and contain only letters, numbers, or _",
//       );
//       return;
//     }

//     // Email check
//     if (!emailRegex.test(email)) {
//       alert("Enter a valid email address!");
//       return;
//     }

//     // Password check
//     if (!passwordRegex.test(password)) {
//       alert(
//     "Password must be at least 8 characters and include uppercase, lowercase, number and special character!"
//   );
//   return;
//     }

//     alert("Signup Successful!");
//     onBack(); // goes back to login after successful signup
//   };

//   return (
//     <div className="login-dark d-flex justify-content-center align-items-center vh-100 w-100">
//       <div className="card login-card shadow-lg p-4">
//         <div className="card-body">
//           <h3 className="text-center text-white mb-3">Create Account</h3>

//           <form onSubmit={handleSignup}>
//             {/* <input
//               type="text"
//               className="form-control input-dark mb-2"
//               placeholder="Username"
//               required
//             /> */}

//              <input
//               type="text"
//               className="form-control input-dark mb-2"
//               placeholder="Username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />

//             {/* <input
//               type="email"
//               className="form-control input-dark mb-2"
//               placeholder="Email"
//               required
//             /> */}

            

//             <input type="email"
//               className="form-control input-dark mb-2"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required />

//             {/* <input
//               type="password"
//               className="form-control input-dark mb-3"
//               placeholder="Password"
//               required
//             /> */}

//              <input
//               type="password"
//               className="form-control input-dark mb-3"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />

//             <button type="submit" className="btn btn-login w-100 mb-3">
//               Sign Up
//             </button>
//           </form>

//           <button
//             className="btn btn-link w-100 text-decoration-none"
//             onClick={onBack}
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Signup;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    // Username validation
    if (!usernameRegex.test(username)) {
      alert(
        "Username must be 3-15 characters and contain only letters, numbers, or _"
      );
      return;
    }

    // Email validation
    if (!emailRegex.test(email)) {
      alert("Enter a valid email address!");
      return;
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character!"
      );
      return;
    }

    alert("Signup Successful!");

    // ✅ Redirect to Login page
    navigate("/");
  };

  return (
    <div className="login-dark d-flex justify-content-center align-items-center vh-100 w-100">
      <div className="card login-card shadow-lg p-4">
        <div className="card-body">
          <h3 className="text-center text-white mb-3">Create Account</h3>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              className="form-control input-dark mb-2"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              className="form-control input-dark mb-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control input-dark mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-login w-100 mb-3">
              Sign Up
            </button>
          </form>

          {/* ✅ Back to Login */}
          <button
            className="btn btn-link w-100 text-decoration-none"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
