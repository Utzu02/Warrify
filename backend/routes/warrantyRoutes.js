import express from 'express';
import {
  createWarranty,
  listWarranties,
  getWarranty,
  updateWarranty,
  deleteWarranty
} from '../crud/warrantyCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

router.post('/warranties', userMiddleware, createWarranty);
router.get('/warranties', userMiddleware, listWarranties);
router.get('/warranties/:id', userMiddleware, getWarranty);
router.patch('/warranties/:id', userMiddleware, updateWarranty);
router.delete('/warranties/:id', userMiddleware, deleteWarranty);

export default router;
