import { apiFetch } from './client';

export const saveGmailOptions = (payload: { maxResults: number; startDate: string | null; endDate: string | null }) => {
  // Save to localStorage for mobile persistence
  localStorage.setItem('gmailScanOptions', JSON.stringify(payload));
  
  // Also save to backend session (for desktop)
  return apiFetch('/api/gmail/options', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const fetchGmailEmails = <T = { total: number; documents: unknown[] }>(socketId?: string) => {
  // Get scan options from localStorage (persists on mobile)
  const savedOptions = localStorage.getItem('gmailScanOptions');
  const options = savedOptions ? JSON.parse(savedOptions) : { maxResults: 10 };
  
  // Build URL with query params
  const params = new URLSearchParams();
  if (socketId) params.append('socketId', socketId);
  if (options.maxResults) params.append('maxResults', options.maxResults.toString());
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  
  const url = `/api/emails?${params.toString()}`;
  
  // Get Google access token from localStorage
  const googleToken = localStorage.getItem('googleAccessToken');
  const headers: Record<string, string> = {};
  
  if (googleToken) {
    headers['Authorization'] = `Bearer ${googleToken}`;
  }
  
  return apiFetch<T>(url, { headers });
};
