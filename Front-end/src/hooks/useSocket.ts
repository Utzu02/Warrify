import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../config';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing socket connection to:', BASE_URL);
    
    // Create socket connection with reconnection settings
    // Try polling first (more reliable on some hosting platforms)
    const socketInstance = io(BASE_URL, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id || null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      setSocketId(null);
      
      // Auto-reconnect if server initiated disconnect
      if (reason === 'io server disconnect') {
        console.log('🔄 Reconnecting...');
        socketInstance.connect();
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error.message);
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    socketId
  };
};
