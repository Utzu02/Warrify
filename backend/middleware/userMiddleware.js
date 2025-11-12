import { verifyToken } from '../utils/jwtUtils.js';

export const userMiddleware = (req, res, next) => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies?.authToken;
    
    console.log('🔐 Auth Middleware - Cookies received:', Object.keys(req.cookies || {}));
    console.log('🔐 Auth Middleware - authToken present:', !!token);
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    console.log('✅ Auth Middleware - Token verified for user:', decoded.userId);
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.username = decoded.username;
    
    next();
  } catch (error) {
    console.log('❌ Auth Middleware - Token verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};
