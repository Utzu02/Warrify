import express from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser
} from '../crud/userCrud.js';

const router = express.Router();

// Create a new user
router.post('/users', createUser);

// Get all users
router.get('/users', listUsers);

// Get a user by ID
router.get('/users/:id', getUser);

// Update a user by ID
router.patch('/users/:id', updateUser);

// Delete a user by ID
router.delete('/users/:id', deleteUser);

export default router;
