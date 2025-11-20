import { apiFetch } from './client';
import { NotificationItem } from '../types/notification';

export const fetchNotifications = async (): Promise<NotificationItem[]> =>
  apiFetch<NotificationItem[]>('/api/notifications');

export const deleteNotification = async (id: string) =>
  apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });

export const clearNotifications = async () =>
  apiFetch('/api/notifications', { method: 'DELETE' });

export const markNotificationRead = async (id: string) =>
  apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
