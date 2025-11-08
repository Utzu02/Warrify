import express from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser
} from '../crud/userCrud.js';

const router = express.Router();

router.post('/users', createUser);
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
