export const timeAgo = (dateStr?: string | number | Date) => {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' || typeof dateStr === 'number' ? new Date(dateStr) : dateStr;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
};
