import { Router } from 'express';
import { getConversations, getMessages, startConversation } from '../controllers/chat.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', getConversations);
router.post('/', startConversation);
router.get('/:id/messages', getMessages);

export default router;
