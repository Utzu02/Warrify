import { useState, useEffect, useMemo } from 'react';
import { fetchGmailEmails } from '../api/gmail';
import { useSocket } from './useSocket';

interface Attachment {
  filename: string;
  size: number;
  attachmentId?: string;
}

interface ProcessedEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  attachments: Attachment[];
}

interface SocketProgress {
  current: number;
  total: number;
  message: string;
}

interface SocketStatus {
  message: string;
  step: number;
  total: number;
}

interface UseGmailScanResult {
  documents: ProcessedEmail[];
  loading: boolean;
  error: string | null;
  statusMessage: string;
  progress: SocketProgress | null;
  lastUpdated: Date | null;
  totalAttachments: number;
}

export const useGmailScan = (userId?: string): UseGmailScanResult => {
  const { socket, socketId } = useSocket();
  const [documents, setDocuments] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Preparing to scan...');
  const [progress, setProgress] = useState<SocketProgress | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Save Google token from URL to localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('googleAccessToken', decodeURIComponent(token));
      console.log('✅ Google access token saved to localStorage');
      
      // Clean URL (remove token from URL for security)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleStatus = (data: SocketStatus) => {
      setStatusMessage(data.message);
    };

    const handleProgress = (data: SocketProgress) => {
      setProgress(data);
      setStatusMessage(data.message);
    };

    const handleComplete = (result: { total: number; documents: ProcessedEmail[] }) => {
      const now = new Date();
      setDocuments(result.documents || []);
      setLastUpdated(now);
      setLoading(false);
      setProgress(null);
    };

    const handleError = (data: { error: string }) => {
      setError(data.error);
      setLoading(false);
      setProgress(null);
    };

    socket.on('gmail:status', handleStatus);
    socket.on('gmail:progress', handleProgress);
    socket.on('gmail:complete', handleComplete);
    socket.on('gmail:error', handleError);

    return () => {
      socket.off('gmail:status', handleStatus);
      socket.off('gmail:progress', handleProgress);
      socket.off('gmail:complete', handleComplete);
      socket.off('gmail:error', handleError);
    };
  }, [socket]);

  // Rotating status messages while loading
  useEffect(() => {
    if (!loading) {
      return;
    }

    let index = 0;
    const defaultSteps = [
      'Connecting to Gmail...',
      'Looking for PDF attachments...',
      'Checking if each document is a warranty...',
      'Almost done...'
    ];
    
    const intervalId = setInterval(() => {
      index = (index + 1) % defaultSteps.length;
      setStatusMessage(defaultSteps[index]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [loading]);

  // Start Gmail scan
  useEffect(() => {
    let isMounted = true;

    async function loadEmails() {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          setError('Please log in to run the Gmail scan.');
          setLoading(false);
          return;
        }

        // Wait for socket connection
        if (!socketId) {
          console.log('Waiting for socket connection...');
          return;
        }

        console.log('Starting Gmail scan with Socket.IO');
        console.log('📤 Sending request to backend...');
        const startTime = Date.now();
        
        await fetchGmailEmails(socketId);
        
        const elapsed = Date.now() - startTime;
        console.log(`✅ Request sent after ${elapsed}ms`);
        
        // Results will be handled by socket events (gmail:complete)

      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unexpected error.');
        setLoading(false);
      }
    }

    if (socketId) {
      loadEmails();
    }

    return () => {
      isMounted = false;
    };
  }, [socketId, userId]);

  const totalAttachments = useMemo(() => {
    return documents.reduce((sum, doc) => sum + doc.attachments.length, 0);
  }, [documents]);

  return {
    documents,
    loading,
    error,
    statusMessage,
    progress,
    lastUpdated,
    totalAttachments
  };
};
