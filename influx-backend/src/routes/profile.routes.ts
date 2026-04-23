import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { 
  getPublicProfile,
  updateInfluencerProfile, 
  updateBrandProfile,
  getDashboardStats,
  searchProfiles 
} from '../controllers/profile.controller';

const router = Router();

// Public Routes
router.get('/@:username', getPublicProfile);
router.get('/stats/me', verifyToken, getDashboardStats);
router.get('/search', searchProfiles);

// Protected Routes
router.patch('/influencer/me', verifyToken, updateInfluencerProfile);
router.patch('/brand/me', verifyToken, updateBrandProfile);

export default router;
