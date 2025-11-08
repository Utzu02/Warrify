import express from 'express';
import {
  createWarranty,
  listWarranties,
  getWarranty,
  updateWarranty,
  deleteWarranty
} from '../crud/warrantyCrud.js';

const router = express.Router();

router.post('/warranties', createWarranty);
router.get('/warranties', listWarranties);
router.get('/warranties/:id', getWarranty);
router.patch('/warranties/:id', updateWarranty);
router.delete('/warranties/:id', deleteWarranty);

export default router;
