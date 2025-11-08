export const sanitizeFilename = (name = 'document.pdf') =>
  String(name)
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '_')
    .substring(0, 100) || 'document.pdf';
