import express from 'express';
import multer from 'multer';
import { uploadWarrantyFile, getWarrantyFile } from '../crud/warrantyFileCrud.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/warranties2', upload.single('pdf'), uploadWarrantyFile);
router.get('/warranties2/:id', getWarrantyFile);

export default router;
