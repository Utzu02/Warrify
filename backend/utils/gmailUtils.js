export const extractPDFAttachments = (parts, attachments = [], depth = 0) => {
  parts.forEach((part) => {
    // Check if it's a PDF attachment
    const isPDF = part.mimeType === 'application/pdf' || part.filename?.endsWith('.pdf');
    const hasAttachmentId = part.body?.attachmentId;
    
    if (isPDF && hasAttachmentId) {
      attachments.push({
        filename: part.filename || `document-${Date.now()}.pdf`,
        size: part.body?.size || 0,
        attachmentId: part.body?.attachmentId
      });
    }
    
    // Recursively check nested parts
    if (part.parts) {
      extractPDFAttachments(part.parts, attachments, depth + 1);
    }
  });
  return attachments;
};

export const getHeader = (headers, name) => headers.find((h) => h.name === name)?.value || 'Necunoscut';

export const evaluateWarrantyScore = (text = '') => {
  if (!text) return 0;
  const normalized = text.toLowerCase();
  const checks = [
    { pattern: /certificat\s+de\s+garan/i, score: 2 },
    { pattern: /(model|marca|tip)\s+[a-z0-9]/i, score: 1 },
    { pattern: /(serie|serial|sn)[\s:]/i, score: 1 },
    { pattern: /factura|bon\s+fiscal|data\s+(achizitiei|cumpararii)/i, score: 1 },
    { pattern: /garant(i|ie)\s+(valabil|expira|luni|ani)/i, score: 1 },
    { pattern: /(defect|remediere|interventie)/i, score: 1 },
    { pattern: /(service|contact|suport).*(tel|telefon|email)/i, score: 1 }
  ];

  return checks.reduce((sum, check) => (check.pattern.test(normalized) ? sum + check.score : sum), 0);
};

export const parseDateString = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatGmailDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
