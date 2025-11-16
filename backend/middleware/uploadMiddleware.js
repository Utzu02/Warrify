import multer from 'multer';

export const PDF_MAX_SIZE_BYTES = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const pdfUpload = multer({
  storage,
  limits: {
    fileSize: PDF_MAX_SIZE_BYTES
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const singlePdfUpload = (fieldName = 'pdf') => (req, res, next) => {
  pdfUpload.single(fieldName)(req, res, (error) => {
    if (error) {
      console.error('❌ PDF upload blocked:', error.message);
      return res.status(400).json({ error: error.message || 'Invalid file upload' });
    }
    next();
  });
};
