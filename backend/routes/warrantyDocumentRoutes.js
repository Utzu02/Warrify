import express from 'express';
import {
  getScanInfo,
  listUserWarranties,
  downloadWarrantyFile
} from '../crud/warrantyDocumentCrud.js';

const router = express.Router();

router.get('/users/:userId/scan-info', getScanInfo);
router.get('/users/:userId/warranties', listUserWarranties);
router.get('/warranties/:warrantyId/download', downloadWarrantyFile);

export default router;
