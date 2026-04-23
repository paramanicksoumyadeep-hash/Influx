import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { accessToken, isAuthenticated, isHydrated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Wait for hydration to ensure accessToken is loaded from storage
    if (!isHydrated) return;

    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        console.log('Socket disconnecting due to missing auth');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      console.log('Attempting socket connection with token:', accessToken.substring(0, 10) + '...');
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: accessToken
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return () => {
      // We don't necessarily want to disconnect on every unmount if this is used globally,
      // but for specific page usage it's safer.
      // However, usually we want a single socket per session.
    };
  }, [isAuthenticated, accessToken]);

  return {
    socket: socketRef.current,
    isConnected
  };
};
