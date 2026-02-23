import React, { useState } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  /* ================= USER INFO ================= */

  const [user] = useState({
    name: "Mahesh Kumar",
    username: "@maheshkumar",
    about: [
      "📚 B.Tech | CSE Student",
      "💼 Aspiring MERN Developer",
      "🌍 India",
    ],
    coverPic:
      "https://static.vecteezy.com/system/resources/thumbnails/002/011/916/small_2x/paper-cut-luxury-gold-background-with-metal-texture-3d-abstract-for-gift-card-poster-on-wall-poster-template-landing-page-ui-ux-cover-book-banner-free-vector.jpg",
  });

  const [profilePic, setProfilePic] = useState(
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );

  /* ================= POSTS ================= */

  const [posts] = useState([
    {
      id: 1,
      text: "Working on SocialX project! 🔥",
      time: "2 days ago",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    },
    {
      id: 2,
      text: "Learning React Hooks ⚡",
      time: "5 days ago",
      image: null,
    },
    {
      id: 3,
      text: "Beautiful sunset today 🌇",
      time: "1 week ago",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
  ]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfilePic(imageURL);
    }
  };

  return (
    <div className="profile-bg">
      {/* ================= COVER PHOTO ================= */}
      <div className="cover-photo">
        <img src={user.coverPic} alt="cover" className="cover-img" />
      </div>

      {/* ================= PROFILE HEADER ================= */}
      <div className="profile-section">
        <div className="profile-pic">
          <img src={profilePic} alt="profile" />

          <input
            type="file"
            accept="image/*"
            id="profileUpload"
            onChange={handleProfileChange}
            hidden
          />

          <label htmlFor="profileUpload" className="camera-icon">
            📷
          </label>
        </div>

        <div className="profile-details">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-username">{user.username}</p>

          <button
            className="settings-circle-btn"
            onClick={() => navigate("/settings")}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="profile-container">
        {/* LEFT COLUMN */}
        <div className="left-col">
          <div className="profile-card about-card">
            <h4>About</h4>
            {user.about.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>

          <div className="profile-card friends-card">
            <h4>Friends</h4>
            <div className="friends-grid">
              <div className="friend-box">JD</div>
              <div className="friend-box">JS</div>
              <div className="friend-box">RK</div>
              <div className="friend-box">MK</div>
              <div className="friend-box">AK</div>
              <div className="friend-box">VP</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-col">
          <div className="profile-card">
            <h4>Your Posts</h4>

            <div className="profile-post-grid">
              {posts.map((post) => (
                <div className="single-post" key={post.id}>
                  <p className="post-text">{post.text}</p>

                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="post-image"
                    />
                  )}

                  <small className="text-muted">{post.time}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
