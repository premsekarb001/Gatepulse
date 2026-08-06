import { Router } from 'express';
import multer from 'multer';
import { parseAndSaveDriveHandler, getDrivesHandler, matchCVHandler } from '../controllers/driveController';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (allowedTypes.includes(file.mimetype) || ['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed formats: .pdf, .docx, .doc, .txt'));
    }
  }
});

// POST /api/v1/ingest/parse-and-save
router.post('/ingest/parse-and-save', parseAndSaveDriveHandler);

// GET /api/v1/drives
router.get('/drives', getDrivesHandler);

// POST /api/v1/match-cv
router.post('/match-cv', upload.single('resume'), matchCVHandler);

export default router;
