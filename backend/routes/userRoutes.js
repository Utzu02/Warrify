import express from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateGmailSettings,
  getGmailSettings,
  disconnectGmail
} from '../crud/userCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { ensureSelfOrAdmin } from '../middleware/ownershipMiddleware.js';

const router = express.Router();

router.get('/users', userMiddleware, adminMiddleware, listUsers);
router.get('/users/:id', userMiddleware, ensureSelfOrAdmin, getUser);
router.patch('/users/:id', userMiddleware, ensureSelfOrAdmin, updateUser);
router.delete('/users/:id', userMiddleware, ensureSelfOrAdmin, deleteUser);

// Gmail settings routes
router.get('/gmail/settings', userMiddleware, getGmailSettings);
router.post('/gmail/settings', userMiddleware, updateGmailSettings);
router.post('/gmail/disconnect', userMiddleware, disconnectGmail);

export default router;
