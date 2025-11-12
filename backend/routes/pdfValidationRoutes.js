import express from 'express';
import multer from 'multer';
import { validateWarrantyPDF, clearValidationCache } from '../crud/pdfValidationCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

// Configure multer for memory storage (don't save to disk yet)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// POST /api/validate-pdf - Validate a PDF before upload
router.post('/validate-pdf', userMiddleware, upload.single('pdf'), validateWarrantyPDF);

// DELETE /api/validate-pdf/cache - Clear validation cache (admin/testing)
router.delete('/validate-pdf/cache', userMiddleware, clearValidationCache);

export default router;
