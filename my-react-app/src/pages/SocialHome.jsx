// src/pages/SocialHome.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { postsAPI, usersAPI, friendsAPI } from "../services/api";
import "../SocialHome.css";
import "./SocialHome.extra.css";

function SocialHome({ onLogout, currentUser }) {
  const navigate = useNavigate();

  const [posts,         setPosts]         = useState([]);
  const [newPost,       setNewPost]       = useState("");
  const [postImage,     setPostImage]     = useState(null);
  const [postImagePrev, setPostImagePrev] = useState(null);
  const [postError,     setPostError]     = useState("");
  const [posting,       setPosting]       = useState(false);
  const [feedLoading,   setFeedLoading]   = useState(true);
  const fileInputRef = useRef(null);

  const [commentState, setCommentState] = useState({});

  const [search,        setSearch]        = useState("");
  const [showResults,   setShowResults]   = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  const [viewingUser,   setViewingUser]   = useState(null);
  const [userPosts,     setUserPosts]     = useState([]);
  const [userPostsLoad, setUserPostsLoad] = useState(false);
  const [friendStatus,  setFriendStatus]  = useState("none");

  useEffect(() => {
    postsAPI.getFeed()
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("Feed error:", err))
      .finally(() => setFeedLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      usersAPI.search(search).then((d) => setSearchResults(d.users)).catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setViewingUser(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setPostError("Image must be under 5MB."); return; }
    setPostError("");
    setPostImagePrev(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => setPostImage(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPostImage(null); setPostImagePrev(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !postImage) return;
    setPostError(""); setPosting(true);
    try {
      const data = await postsAPI.createPost(newPost.trim() || "📷", postImage);
      setPosts((prev) => [data.post, ...prev]);
      setNewPost(""); removeImage();
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = useCallback(async (postId) => {
    try {
      const data = await postsAPI.toggleLike(postId);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: data.post.likes } : p));
    } catch (err) { console.error(err); }
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postsAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) { alert(err.message); }
  };

  const toggleComments = (postId) => {
    setCommentState((prev) => ({
      ...prev,
      [postId]: { open: !prev[postId]?.open, text: prev[postId]?.text || "", loading: false }
    }));
  };

  const submitComment = async (postId) => {
    const text = commentState[postId]?.text?.trim();
    if (!text) return;
    setCommentState((prev) => ({ ...prev, [postId]: { ...prev[postId], loading: true } }));
    try {
      const data = await postsAPI.addComment(postId, text);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p));
      setCommentState((prev) => ({ ...prev, [postId]: { ...prev[postId], text: "", loading: false } }));
    } catch (err) {
      setCommentState((prev) => ({ ...prev, [postId]: { ...prev[postId], loading: false } }));
    }
  };

  const openUserProfile = async (user) => {
    if (user._id === currentUser?._id) { navigate("/profile"); return; }
    setViewingUser({ ...user });
    setUserPosts([]); setUserPostsLoad(true); setFriendStatus("none");
    setShowResults(false); setSearch("");
    try {
      const [profileData, postsData] = await Promise.all([
        usersAPI.getProfile(user._id),
        postsAPI.getUserPosts(user._id),
      ]);
      setViewingUser(profileData.user);
      setUserPosts(postsData.posts);
      const isFriend = profileData.user.friends?.some(
        (f) => (typeof f === "object" ? f._id : f) === currentUser?._id
      );
      setFriendStatus(isFriend ? "friends" : "none");
    } catch (err) {
      console.error(err);
    } finally {
      setUserPostsLoad(false);
    }
  };

  const handleAddFriend = async () => {
    if (!viewingUser) return;
    try {
      await friendsAPI.sendRequest(viewingUser._id);
      setFriendStatus("sent");
    } catch (err) { alert(err.message); }
  };

  const handleMessage = () => {
    if (!viewingUser) return;
    navigate("/chat", { state: { openUserId: viewingUser._id } });
  };

  const getInitials = (user) => {
    if (!user) return "?";
    return (user.name || user.username || "?").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const isLiked = (post) => {
    if (!currentUser) return false;
    return post.likes?.some((id) => (typeof id === "object" ? id._id : id) === currentUser._id);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const s = Math.floor(diff / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const myInitials = getInitials(currentUser);

  return (
    <div className="sx-home">

      {/* NAVBAR */}
      <nav className="sx-nav">
        <div className="sx-nav-inner">
          <div className="sx-logo" onClick={() => navigate("/home")}>SocialX</div>

          <div className="sx-nav-links">
            <NavLink to="/home"    className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Home</NavLink>
            <NavLink to="/friends" className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Friends</NavLink>
            <NavLink to="/chat"    className={({ isActive }) => `sx-nav-link${isActive ? " active" : ""}`}>Messages</NavLink>
          </div>

          <div className="sx-search-wrap" ref={searchRef}>
            <span className="sx-search-icon">⌕</span>
            <input
              className="sx-search-input"
              placeholder="Search people…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
            />
            {search && <span className="sx-search-clear" onClick={() => { setSearch(""); setSearchResults([]); }}>×</span>}
            {showResults && search && (
              <div className="sx-search-dropdown">
                {searchResults.length === 0
                  ? <div className="sx-search-empty">No users found</div>
                  : searchResults.map((u) => (
                    <div key={u._id} className="sx-search-result" onClick={() => openUserProfile(u)}>
                      <div className="sx-search-avatar">
                        {u.profilePic ? <img src={u.profilePic} alt="" /> : <span>{getInitials(u)}</span>}
                        {u.isOnline && <div className="sx-online-dot" />}
                      </div>
                      <div className="sx-search-info">
                        <div className="sx-search-name">{u.name || u.username}</div>
                        <div className="sx-search-user">@{u.username}</div>
                      </div>
                      <span className="sx-search-arrow">→</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div className="sx-nav-right">
            <div className="sx-nav-avatar" onClick={() => navigate("/profile")}>
              {currentUser?.profilePic ? <img src={currentUser.profilePic} alt="me" /> : <span>{myInitials}</span>}
            </div>
            <button className="sx-logout-btn" onClick={async () => { await onLogout(); navigate("/"); }}>Sign out</button>
          </div>
        </div>
      </nav>

      {/* 3-COLUMN LAYOUT */}
      <div className="sx-layout">

        {/* LEFT */}
        <aside className="sx-sidebar-left">
          <div className="sx-side-profile" onClick={() => navigate("/profile")}>
            <div className="sx-side-av">
              {currentUser?.profilePic ? <img src={currentUser.profilePic} alt="me" /> : <span>{myInitials}</span>}
            </div>
            <div>
              <div className="sx-side-name">{currentUser?.name || currentUser?.username}</div>
              <div className="sx-side-uname">@{currentUser?.username}</div>
            </div>
          </div>
          <div className="sx-side-divider" />
          {[
            { icon: "🏠", label: "Home",     path: "/home" },
            { icon: "👥", label: "Friends",  path: "/friends" },
            { icon: "💬", label: "Messages", path: "/chat" },
            { icon: "👤", label: "Profile",  path: "/profile" },
            { icon: "⚙️", label: "Settings", path: "/settings" },
          ].map(({ icon, label, path }) => (
            <div key={path} className="sx-side-link" onClick={() => navigate(path)}>
              <span className="sx-side-icon">{icon}</span>{label}
            </div>
          ))}
          <div className="sx-side-divider" />
          <div className="sx-side-stats">
            <div className="sx-stat-item"><strong>{currentUser?.friends?.length || 0}</strong><span>Friends</span></div>
            <div className="sx-stat-item"><strong>{posts.filter(p => p.author?._id === currentUser?._id).length}</strong><span>Posts</span></div>
          </div>
        </aside>

        {/* FEED */}
        <main className="sx-feed">

          {/* Create Post */}
          <div className="sx-create-card">
            <div className="sx-create-row">
              <div className="sx-create-av">
                {currentUser?.profilePic ? <img src={currentUser.profilePic} alt="me" /> : <span>{myInitials}</span>}
              </div>
              <input
                className="sx-create-input"
                placeholder={`What's on your mind, ${currentUser?.name?.split(" ")[0] || currentUser?.username}?`}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreatePost()}
              />
            </div>

            {postImagePrev && (
              <div className="sx-img-preview-wrap">
                <img src={postImagePrev} alt="preview" className="sx-img-preview" />
                <button className="sx-img-remove" onClick={removeImage}>×</button>
              </div>
            )}

            {postError && <p className="sx-post-error">{postError}</p>}

            <div className="sx-create-footer">
              <div className="sx-create-tools">
                <button className="sx-tool-btn" onClick={() => fileInputRef.current?.click()}>
                  📷 Photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
                <button className="sx-tool-btn">😊 Feeling</button>
                <button className="sx-tool-btn">📍 Location</button>
              </div>
              <button
                className="sx-post-btn"
                onClick={handleCreatePost}
                disabled={posting || (!newPost.trim() && !postImage)}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          {/* Loading skeletons */}
          {feedLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1,2,3].map((i) => (
                <div key={i} className="sx-skeleton-card">
                  <div className="sx-skeleton-av" />
                  <div style={{ flex: 1 }}>
                    <div className="sx-skeleton-line" style={{ width: "40%" }} />
                    <div className="sx-skeleton-line" style={{ width: "70%", marginTop: 8 }} />
                    <div className="sx-skeleton-line" style={{ width: "55%", marginTop: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!feedLoading && posts.length === 0 && (
            <div className="sx-empty">
              <div style={{ fontSize: 48 }}>🌐</div>
              <h3>No posts yet</h3>
              <p>Be the first to share something!</p>
            </div>
          )}

          {posts.map((post) => {
            const author = post.author || {};
            const liked  = isLiked(post);
            const isOwn  = author._id === currentUser?._id;
            const cs     = commentState[post._id] || { open: false, text: "", loading: false };

            return (
              <article key={post._id} className="sx-post">

                <div className="sx-post-head">
                  <div className="sx-post-author-row" onClick={() => author._id && openUserProfile(author)}>
                    <div className="sx-post-av">
                      {author.profilePic ? <img src={author.profilePic} alt="" /> : <span>{getInitials(author)}</span>}
                      {author.isOnline && <div className="sx-post-dot" />}
                    </div>
                    <div>
                      <div className="sx-post-author-name">{author.name || author.username}</div>
                      <div className="sx-post-time">@{author.username} · {timeAgo(post.createdAt)}</div>
                    </div>
                  </div>
                  {isOwn && (
                    <button className="sx-delete-btn" onClick={() => handleDelete(post._id)} title="Delete">🗑</button>
                  )}
                </div>

                <p className="sx-post-text">{post.content}</p>

                {post.image && (
                  <div className="sx-post-img-wrap">
                    <img src={post.image} alt="post" className="sx-post-img" />
                  </div>
                )}

                {/* Stats */}
                {(post.likes?.length > 0 || post.comments?.length > 0) && (
                  <div className="sx-post-stats-bar">
                    {post.likes?.length > 0 && <span>❤️ {post.likes.length}</span>}
                    {post.comments?.length > 0 && (
                      <span className="sx-clickable" onClick={() => toggleComments(post._id)}>
                        {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}

                <div className="sx-post-divider" />

                <div className="sx-post-actions-bar">
                  <button className={`sx-act-btn${liked ? " sx-act-liked" : ""}`} onClick={() => handleLike(post._id)}>
                    {liked ? "❤️" : "🤍"} Like
                  </button>
                  <button className="sx-act-btn" onClick={() => toggleComments(post._id)}>
                    💬 Comment
                  </button>
                  <button className="sx-act-btn">↗ Share</button>
                </div>

                {/* Comments */}
                {cs.open && (
                  <div className="sx-comments">
                    {(post.comments || []).map((c, i) => {
                      const cu = c.user || {};
                      return (
                        <div key={i} className="sx-cmt">
                          <div className="sx-cmt-av">
                            {cu.profilePic ? <img src={cu.profilePic} alt="" /> : <span>{getInitials(cu)}</span>}
                          </div>
                          <div className="sx-cmt-bubble">
                            <span className="sx-cmt-name">{cu.name || cu.username || "User"}</span>
                            <p className="sx-cmt-text">{c.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    {!(post.comments?.length) && <p className="sx-no-cmt">No comments yet. Be first! 👇</p>}

                    <div className="sx-cmt-input-row">
                      <div className="sx-cmt-my-av">
                        {currentUser?.profilePic ? <img src={currentUser.profilePic} alt="me" /> : <span>{myInitials}</span>}
                      </div>
                      <div className="sx-cmt-input-wrap">
                        <input
                          className="sx-cmt-input"
                          placeholder="Write a comment…"
                          value={cs.text}
                          onChange={(e) => setCommentState((prev) => ({ ...prev, [post._id]: { ...prev[post._id], text: e.target.value } }))}
                          onKeyDown={(e) => e.key === "Enter" && submitComment(post._id)}
                        />
                        <button className="sx-cmt-send" onClick={() => submitComment(post._id)} disabled={cs.loading || !cs.text?.trim()}>
                          {cs.loading ? "…" : "↵"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </main>

        {/* RIGHT */}
        <aside className="sx-sidebar-right">
          <div className="sx-widget">
            <h4 className="sx-widget-title">🔥 Trending</h4>
            {["#ReactJS", "#MERNStack", "#WebDev", "#OpenSource", "#JavaScript"].map((t) => (
              <div key={t} className="sx-trend">{t}</div>
            ))}
          </div>
          <div className="sx-widget">
            <h4 className="sx-widget-title">💡 Did you know?</h4>
            <p className="sx-widget-text">You can upload photos when creating a post. Images are stored securely.</p>
          </div>
          <div className="sx-widget sx-widget-footer">
            <p>SocialX · Built with MERN</p>
          </div>
        </aside>
      </div>

      {/* USER PROFILE MODAL */}
      {viewingUser && (
        <div className="sx-overlay" onClick={(e) => { if (e.target === e.currentTarget) setViewingUser(null); }}>
          <div className="sx-modal">
            <div className="sx-modal-cover">
              <button className="sx-modal-close" onClick={() => setViewingUser(null)}>×</button>
            </div>

            <div className="sx-modal-content">
              {/* Avatar overlapping cover */}
              <div className="sx-modal-av-wrap">
                <div className="sx-modal-av">
                  {viewingUser.profilePic
                    ? <img src={viewingUser.profilePic} alt={viewingUser.username} />
                    : <span>{getInitials(viewingUser)}</span>
                  }
                  {viewingUser.isOnline && <div className="sx-modal-av-dot" />}
                </div>
              </div>

              <h2 className="sx-modal-name">{viewingUser.name || viewingUser.username}</h2>
              <p className="sx-modal-uname">@{viewingUser.username}</p>
              <p className="sx-modal-meta">
                {viewingUser.isOnline ? "🟢 Online" : "⚫ Offline"}&nbsp;·&nbsp;
                <strong>{viewingUser.friends?.length || 0}</strong> friends
              </p>
              {viewingUser.about?.length > 0 && (
                <p className="sx-modal-bio">{viewingUser.about.join(" · ")}</p>
              )}

              {/* Friend / Message buttons */}
              <div className="sx-modal-btns">
                {friendStatus === "friends" ? (
                  <>
                    <button className="sx-mbtn sx-mbtn-primary" onClick={handleMessage}>💬 Message</button>
                    <button className="sx-mbtn sx-mbtn-secondary" disabled>✓ Friends</button>
                  </>
                ) : friendStatus === "sent" ? (
                  <>
                    <button className="sx-mbtn sx-mbtn-primary" onClick={handleMessage}>💬 Message</button>
                    <button className="sx-mbtn sx-mbtn-secondary" disabled>✓ Request Sent</button>
                  </>
                ) : (
                  <>
                    <button className="sx-mbtn sx-mbtn-primary" onClick={handleAddFriend}>＋ Add Friend</button>
                    <button className="sx-mbtn sx-mbtn-secondary" onClick={handleMessage}>💬 Message</button>
                  </>
                )}
              </div>

              <div className="sx-modal-divider" />

              <h4 className="sx-modal-posts-title">Posts <span>({userPosts.length})</span></h4>

              {userPostsLoad && (
                <div>
                  <div className="sx-skeleton-line" style={{ width: "100%", height: 60, borderRadius: 8, marginBottom: 10 }} />
                  <div className="sx-skeleton-line" style={{ width: "100%", height: 60, borderRadius: 8 }} />
                </div>
              )}

              {!userPostsLoad && userPosts.length === 0 && (
                <p className="sx-modal-empty">No posts yet.</p>
              )}

              <div className="sx-modal-posts-list">
                {userPosts.map((p) => (
                  <div key={p._id} className="sx-modal-post-item">
                    <p className="sx-modal-post-text">{p.content}</p>
                    {p.image && <img src={p.image} alt="post" className="sx-modal-post-img" />}
                    <div className="sx-modal-post-meta">
                      <span>❤️ {p.likes?.length || 0}</span>
                      <span>💬 {p.comments?.length || 0}</span>
                      <span>{timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialHome;