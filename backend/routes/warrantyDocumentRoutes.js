import express from 'express';
import {
  getScanInfo,
  listUserWarranties,
  downloadWarrantyFile,
  deleteWarrantyDocument
} from '../crud/warrantyDocumentCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

router.get('/users/:userId/scan-info', userMiddleware, getScanInfo);
router.get('/users/:userId/warranties', userMiddleware, listUserWarranties);
router.get('/warranties/:warrantyId/download', userMiddleware, downloadWarrantyFile);
router.delete('/warranties/:warrantyId', userMiddleware, deleteWarrantyDocument);

export default router;
