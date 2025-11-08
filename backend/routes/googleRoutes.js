import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import {
  authRedirect,
  authCallback,
  saveGmailOptionsHandler,
  fetchEmails,
  downloadAttachment,
  DEFAULT_SCAN_OPTIONS
} from '../crud/gmailCrud.js';

dotenv.config();

const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

router.use((req, res, next) => {
  if (!req.session.gmailOptions) {
    req.session.gmailOptions = { ...DEFAULT_SCAN_OPTIONS };
  }
  next();
});

router.get('/auth/google', authRedirect);
router.get('/auth/google/callback', authCallback);
router.post('/api/gmail/options', saveGmailOptionsHandler);
router.get('/api/emails', fetchEmails);
router.get('/api/emails/:messageId/attachments/:attachmentId', downloadAttachment);

export default router;
