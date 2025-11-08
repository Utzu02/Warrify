import { apiFetch } from './client';

export const saveGmailOptions = (payload: { maxResults: number; startDate: string | null; endDate: string | null }) =>
  apiFetch('/api/gmail/options', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const fetchGmailEmails = <T = { total: number; documents: unknown[] }>() => apiFetch<T>('/api/emails');
