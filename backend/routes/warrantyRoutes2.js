import express from 'express';
import multer from 'multer';
import { uploadWarrantyFile, getWarrantyFile } from '../crud/warrantyFileCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/warranties2', userMiddleware, upload.single('pdf'), uploadWarrantyFile);
router.get('/warranties2/:id', userMiddleware, getWarrantyFile);

export default router;
