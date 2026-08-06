import { Router } from 'express';
import { parseAndSaveDriveHandler, getDrivesHandler } from '../controllers/driveController';

const router = Router();

// POST /api/v1/ingest/parse-and-save
router.post('/ingest/parse-and-save', parseAndSaveDriveHandler);

// GET /api/v1/drives
router.get('/drives', getDrivesHandler);

export default router;
