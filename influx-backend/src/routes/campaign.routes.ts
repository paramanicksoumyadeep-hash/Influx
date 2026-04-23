import { Router } from 'express';
import { 
  createCampaign, 
  getCampaigns, 
  getCampaignDetails, 
  applyToCampaign, 
  getCampaignApplications, 
  updateApplicationStatus 
} from '../controllers/campaign.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Publicly viewable list
router.get('/', getCampaigns);
router.get('/:id', getCampaignDetails);

// Protected routes
router.use(verifyToken);
router.post('/', createCampaign);
router.post('/:id/apply', applyToCampaign);
router.get('/:id/applications', getCampaignApplications);
router.patch('/applications/:id', updateApplicationStatus);

export default router;
