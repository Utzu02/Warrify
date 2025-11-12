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
    
    // Create socket connection
    const socketInstance = io(BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id || null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setSocketId(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
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
