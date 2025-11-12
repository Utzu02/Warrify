import { apiFetch } from './client';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  heuristicScore?: number;
  aiResponse?: string | null;
  reason: string;
  filename?: string;
  fileSize?: number;
}

export const validateWarrantyPdf = (file: File): Promise<ValidationResult> => {
  const formData = new FormData();
  formData.append('pdf', file);
  return apiFetch<ValidationResult>('/api/validate-pdf', {
    method: 'POST',
    body: formData
  });
};

export const uploadWarrantyPdf = (file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  return apiFetch<{ message: string }>('/api/warranties2', {
    method: 'POST',
    body: formData
  });
};
