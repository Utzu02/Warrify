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

const router = express.Router();

router.post('/users', userMiddleware, createUser);
router.get('/users', userMiddleware, listUsers);
router.get('/users/:id', userMiddleware, getUser);
router.patch('/users/:id', userMiddleware, updateUser);
router.delete('/users/:id', userMiddleware, deleteUser);

// Gmail settings routes
router.get('/gmail/settings', userMiddleware, getGmailSettings);
router.post('/gmail/settings', userMiddleware, updateGmailSettings);
router.post('/gmail/disconnect', userMiddleware, disconnectGmail);

export default router;
