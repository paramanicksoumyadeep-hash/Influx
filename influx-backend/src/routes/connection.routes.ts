import { Router } from 'express';
import { 
  sendConnectionRequest, 
  respondToConnectionRequest, 
  getMyConnections 
} from '../controllers/connection.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/', sendConnectionRequest);
router.put('/:id', respondToConnectionRequest);
router.get('/', getMyConnections);

export default router;
