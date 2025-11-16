import { URL } from 'url';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
let cachedOrigins = null;

const parseOrigins = () => {
  if (cachedOrigins) {
    return cachedOrigins;
  }

  const raw = [process.env.CSRF_ALLOWED_ORIGINS, process.env.FRONTEND_URL]
    .filter(Boolean)
    .join(',');

  const origins = new Set();

  raw
    .split(',')
    .map((value) => value?.trim())
    .filter(Boolean)
    .forEach((value) => {
      try {
        const origin = new URL(value).origin;
        origins.add(origin);
      } catch (error) {
        console.warn(`⚠️  Ignoring invalid CSRF origin: ${value}`);
      }
    });

  cachedOrigins = Array.from(origins);
  return cachedOrigins;
};

const isAllowedOrigin = (value) => {
  if (!value) {
    return false;
  }

  try {
    const origin = new URL(value).origin;
    return parseOrigins().includes(origin);
  } catch (error) {
    return false;
  }
};

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const allowedOrigins = parseOrigins();
  if (allowedOrigins.length === 0) {
    // Nothing configured – allow but warn.
    console.warn('⚠️  CSRF middleware has no allowed origins configured.');
    return next();
  }

  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;
  const headerValue = originHeader || refererHeader;

  if (!headerValue) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Missing origin header' });
    }
    return next();
  }

  if (!isAllowedOrigin(headerValue)) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }

  return next();
};
