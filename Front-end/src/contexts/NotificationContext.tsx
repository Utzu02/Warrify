import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NotificationItem } from '../types/notification';
import * as api from '../api/notifications';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface NotificationContextValue {
  notifications: NotificationItem[];
  loading: boolean;
  error?: string | null;
  fetchNotifications: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await api.fetchNotifications();
      setNotifications(items || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
      showToast({ title: 'Error', message: err?.message || 'Failed to load notifications', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteNotification = useCallback(async (id: string) => {
    // optimistic update
    const prev = notifications;
    setNotifications((s) => s.filter((n) => n._id !== id));
    try {
      await api.deleteNotification(id);
    } catch (err: any) {
      setNotifications(prev);
      showToast({ title: 'Error', message: err?.message || 'Failed to delete notification', variant: 'error' });
    }
  }, [notifications, showToast]);

  const clearAllNotifications = useCallback(async () => {
    const prev = notifications;
    setNotifications([]);
    try {
      await api.clearNotifications();
    } catch (err: any) {
      setNotifications(prev);
      showToast({ title: 'Error', message: err?.message || 'Failed to clear notifications', variant: 'error' });
    }
  }, [notifications, showToast]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err: any) {
      showToast({ title: 'Error', message: err?.message || 'Failed to mark as read', variant: 'error' });
    }
  }, [showToast]);

  // Auto-fetch on login
  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    else setNotifications([]);
  }, [isAuthenticated, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, loading, error, fetchNotifications, deleteNotification, clearAllNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
