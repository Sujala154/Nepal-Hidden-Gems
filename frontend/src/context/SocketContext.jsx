/**
 * SocketContext.jsx
 *
 * Provides a global Socket.io client instance to the application.
 * Handles the initial connection lifecycle, connection error logging (as warnings),
 * and automatic cleanup on unmount.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

/**
 * Custom hook for easy access to the global socket instance.
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // ── Initialization ──
    // Pointing to the local dev server — in production, this should be an environment variable.
    const newSocket = io('http://127.0.0.1:5000', {
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(newSocket);

    // ── Lifecycle Listeners ──
    newSocket.on('connect', () => {
      // Connection established successfully
    });

    newSocket.on('connect_error', (err) => {
      // Connection errors are common in unstable networks; log as warning for debugging.
      console.warn('Socket connection warning:', err.message);
    });

    // ── Cleanup ──
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
