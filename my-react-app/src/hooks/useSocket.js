// src/hooks/useSocket.js
// NEW: Real-time socket connection with automatic auth and cleanup
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { getToken } from "../services/api";

const SOCKET_URL = "http://localhost:5000";

let globalSocket = null;

export const getSocket = () => globalSocket;

export const useSocket = ({
  onReceiveMessage,
  onMessageSent,
  onTypingStart,
  onTypingStop,
  onNewNotification,
  onFriendOnline,
  onFriendOffline,
  onOnlineUsers,
  enabled = true,
} = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const token = getToken();
    if (!token) return;

    // Reuse existing connection or create new one
    if (!globalSocket || !globalSocket.connected) {
      globalSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = globalSocket;

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    if (onReceiveMessage) socket.on("receive_message", onReceiveMessage);
    if (onMessageSent) socket.on("message_sent", onMessageSent);
    if (onTypingStart) socket.on("user_typing", onTypingStart);
    if (onTypingStop) socket.on("user_stop_typing", onTypingStop);
    if (onNewNotification) socket.on("new_notification", onNewNotification);
    if (onFriendOnline) socket.on("friend_online", onFriendOnline);
    if (onFriendOffline) socket.on("friend_offline", onFriendOffline);
    if (onOnlineUsers) socket.on("online_users", onOnlineUsers);

    return () => {
      if (onReceiveMessage) socket.off("receive_message", onReceiveMessage);
      if (onMessageSent) socket.off("message_sent", onMessageSent);
      if (onTypingStart) socket.off("user_typing", onTypingStart);
      if (onTypingStop) socket.off("user_stop_typing", onTypingStop);
      if (onNewNotification) socket.off("new_notification", onNewNotification);
      if (onFriendOnline) socket.off("friend_online", onFriendOnline);
      if (onFriendOffline) socket.off("friend_offline", onFriendOffline);
      if (onOnlineUsers) socket.off("online_users", onOnlineUsers);
    };
  }, [enabled]);

  const sendMessage = useCallback((receiverId, text) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("send_message", { receiverId, text });
      return true;
    }
    return false;
  }, []);

  const startTyping = useCallback((receiverId) => {
    socketRef.current?.emit("typing_start", { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId) => {
    socketRef.current?.emit("typing_stop", { receiverId });
  }, []);

  const markNotificationsRead = useCallback(() => {
    socketRef.current?.emit("mark_notifications_read");
  }, []);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    startTyping,
    stopTyping,
    markNotificationsRead,
    disconnect,
    isConnected: socketRef.current?.connected ?? false,
  };
};