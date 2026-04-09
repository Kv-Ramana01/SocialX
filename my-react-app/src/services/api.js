// src/services/api.js
// Central API service — all backend calls go through here

const BASE_URL = "http://localhost:5000/api";

// ─── Helper ───────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");

const headers = (includeAuth = true) => {
  const h = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
};

const request = async (method, path, body = null, auth = true) => {
  const options = {
    method,
    headers: headers(auth),
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    // Throw the server's message so components can display it
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (username, email, password) =>
    request("POST", "/auth/register", { username, email, password }, false),

  login: (email, password) =>
    request("POST", "/auth/login", { email, password }, false),

  logout: () => request("POST", "/auth/logout"),

  forgotPassword: (email) =>
    request("POST", "/auth/forgot-password", { email }, false),

  getMe: () => request("GET", "/auth/me"),
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postsAPI = {
  getFeed: () => request("GET", "/posts"),

  createPost: (content, image = null) =>
    request("POST", "/posts", { content, image }),

  deletePost: (postId) => request("DELETE", `/posts/${postId}`),

  toggleLike: (postId) => request("PUT", `/posts/${postId}/like`),

  addComment: (postId, text) =>
    request("POST", `/posts/${postId}/comments`, { text }),

  getUserPosts: (userId) => request("GET", `/posts/user/${userId}`),
};

// ─── Friends ──────────────────────────────────────────────────────────────────

export const friendsAPI = {
  getFriends: () => request("GET", "/friends"),

  getRequests: () => request("GET", "/friends/requests"),

  getSuggestions: () => request("GET", "/friends/suggestions"),

  sendRequest: (userId) => request("POST", `/friends/request/${userId}`),

  acceptRequest: (userId) => request("PUT", `/friends/accept/${userId}`),

  declineRequest: (userId) => request("DELETE", `/friends/request/${userId}`),

  removeFriend: (userId) => request("DELETE", `/friends/${userId}`),
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesAPI = {
  getChatList: () => request("GET", "/messages/chats"),

  getConversation: (userId) => request("GET", `/messages/${userId}`),

  sendMessage: (userId, text) =>
    request("POST", `/messages/${userId}`, { text }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersAPI = {
  search: (q) => request("GET", `/users/search?q=${encodeURIComponent(q)}`),

  getProfile: (userId) => request("GET", `/users/${userId}`),

  updateProfile: (fields) => request("PUT", "/users/profile", fields),

  changePassword: (currentPassword, newPassword) =>
    request("PUT", "/users/password", { currentPassword, newPassword }),
};

// ─── Token helpers used by App.jsx ────────────────────────────────────────────

export const saveToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");
export const hasToken   = () => !!localStorage.getItem("token");