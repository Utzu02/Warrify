import express from 'express';
import {
  createWarranty,
  listWarranties,
  getWarranty,
  updateWarranty,
  deleteWarranty
} from '../crud/warrantyCrud.js';
import { uploadWarrantyFile, getWarrantyFile } from '../crud/warrantyFileCrud.js';
import { singlePdfUpload } from '../middleware/uploadMiddleware.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

router.post('/warranties', userMiddleware, createWarranty);
router.get('/warranties', userMiddleware, listWarranties);
router.get('/warranties/:id', userMiddleware, getWarranty);
router.patch('/warranties/:id', userMiddleware, updateWarranty);
router.delete('/warranties/:id', userMiddleware, deleteWarranty);

router.post('/warranties/upload', userMiddleware, singlePdfUpload('pdf'), uploadWarrantyFile);
router.get('/warranties/upload/:id', userMiddleware, getWarrantyFile);

export default router;
