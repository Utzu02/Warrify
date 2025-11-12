import { apiFetch } from './client';

export interface GmailSettings {
  isConnected: boolean;
  connectedAt: string | null;
  defaultSettings: {
    maxResults: number;
    startDate: string | null;
    endDate: string | null;
  };
}

export interface UpdateGmailSettingsPayload {
  maxResults?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export const getGmailSettings = () =>
  apiFetch<GmailSettings>('/api/gmail/settings', {
    method: 'GET'
  });

export const updateGmailSettings = (payload: UpdateGmailSettingsPayload) =>
  apiFetch<{ success: boolean; settings: GmailSettings['defaultSettings'] }>('/api/gmail/settings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const disconnectGmail = () =>
  apiFetch<{ success: boolean; message: string }>('/api/gmail/disconnect', {
    method: 'POST'
  });

export const connectGmail = () => {
  // Redirect to Gmail OAuth flow
  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/google`;
};
