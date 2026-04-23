import { Router } from 'express';
import { 
  registerInfluencer, 
  registerBrand, 
  login, 
  refresh, 
  logout, 
  checkUsername 
} from '../controllers/auth.controller';

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Fallback to memory store if no Redis URL is provided via env
const isRedisAvailable = !!process.env.REDIS_URL;
let storeConfig = {};

if (isRedisAvailable) {
  const redisClient = new Redis(process.env.REDIS_URL!);
  storeConfig = {
    store: new RedisStore({
      // @ts-expect-error - Known typing mismatch with express-rate-limit
      sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
  };
}

const router = Router();

const authLimiter = rateLimit({
  ...storeConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { message: "Too many attempts, please try again after 15 minutes" }
});

router.post('/register/influencer', authLimiter, registerInfluencer);
router.post('/register/brand', authLimiter, registerBrand);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/check-username/:u', checkUsername);

export default router;
