import { apiFetch } from './client';

export const uploadWarrantyPdf = (file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  return apiFetch<{ message: string }>('/api/warranties2', {
    method: 'POST',
    body: formData
  });
};
