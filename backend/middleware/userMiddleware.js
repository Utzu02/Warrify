export const userMiddleware = (req, res, next) => {
  const headerId = req.headers['x-user-id'];
  const sessionId = req.session?.userId;
  const queryId = req.query.userId;

  const userId = headerId || sessionId || queryId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};
