// import React, { useState } from "react";
// import Login from "./Login";
// import Signup from "./Signup";
// import ForgotPassword from "./ForgotPassword";
// import SocialHome from "./SocialHome";

// function App() {
//   const [page, setPage] = useState("login");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   if (isLoggedIn) {
//     return <SocialHome onLogout={() => setIsLoggedIn(false)} />;
//   }

//   // if (page === "signup") {
//   //   return <Signup onBack={() => setPage("login")} />;
//   // }
//   if (page === "signup") {
//     return (
//       <Signup
//         onBack={() => setPage("login")}
//         onSignupComplete={() => setPage("login")}
//       />
//     );
//   }

//   if (page === "forgot") {
//     return <ForgotPassword onBack={() => setPage("login")} />;
//   }

//   return (
//     <Login
//       onLogin={() => setIsLoggedIn(true)}
//       onSignup={() => setPage("signup")}
//       onForgot={() => setPage("forgot")}
//     />
//   );
// }

// export default App;


import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import SocialHome from "./SocialHome";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [error, setError] = useState("");

  // HARD-CODED USER 
  const USER_EMAIL = "admin@gmail.com";
  const USER_PASSWORD = "12345";

  const handleLogin = (email, password) => {
    if (email === USER_EMAIL && password === USER_PASSWORD) {
      setIsLoggedIn(true);
      setError("");
    } else {
      alert("Invalid email or password");
    }
  };

  if (isLoggedIn) {
    return <SocialHome onLogout={() => setIsLoggedIn(false)} />;
  }

  if (page === "signup") {
    return <Signup onBack={() => setPage("login")} />;
  }

  if (page === "forgot") {
    return <ForgotPassword onBack={() => setPage("login")} />;
  }

  return (
    <>
      <Login
        onLogin={handleLogin}
        onSignup={() => setPage("signup")}
        onForgot={() => setPage("forgot")}
      />
    </>
  );
}

export default App;

