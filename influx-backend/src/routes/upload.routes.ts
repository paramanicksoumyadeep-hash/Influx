import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getUploadSignature } from '../controllers/upload.controller';

const router = Router();

// Protected Routes
router.get('/signature', verifyToken, getUploadSignature);

export default router;
