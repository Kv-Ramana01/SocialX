// src/services/api.js
// UPGRADED: Added notifications, post visibility, save, socket helper, cursor pagination

const BASE_URL = "http://localhost:5000/api";

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const saveToken  = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");
export const hasToken   = () => !!localStorage.getItem("token");
export const getToken   = () => localStorage.getItem("token");

// ─── Core Request Helper ──────────────────────────────────────────────────────
const headers = (includeAuth = true) => {
  const h = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
};

const request = async (method, path, body = null, auth = true) => {
  const options = { method, headers: headers(auth) };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
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
  // UPGRADED: cursor-based pagination for infinite scroll
  getFeed: (cursor = null, limit = 15) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append("cursor", cursor);
    return request("GET", `/posts?${params}`);
  },

  // UPGRADED: visibility parameter
  createPost: (content, image = null, visibility = "public") =>
    request("POST", "/posts", { content, image, visibility }),

  deletePost: (postId) => request("DELETE", `/posts/${postId}`),

  toggleLike: (postId) => request("PUT", `/posts/${postId}/like`),

  // NEW: save/bookmark
  toggleSave: (postId) => request("PUT", `/posts/${postId}/save`),

  // NEW: update visibility
  updateVisibility: (postId, visibility) =>
    request("PUT", `/posts/${postId}/visibility`, { visibility }),

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

  // NOTE: For real-time, use socket. This is REST fallback.
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

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (page = 1) => request("GET", `/notifications?page=${page}&limit=20`),

  getUnreadCount: () => request("GET", "/notifications/unread-count"),

  markAllRead: () => request("PUT", "/notifications/read"),

  markOneRead: (id) => request("PUT", `/notifications/${id}/read`),

  delete: (id) => request("DELETE", `/notifications/${id}`),
};