import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as aiController from './ai.controller';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح به لطلبات الاستشارة الذكية، يرجى المحاولة بعد قليل.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/status', aiController.getStatus);
router.get('/suggestions', aiController.getSuggestions);
router.post('/chat', aiLimiter, aiController.chat);
router.post('/chat/stream', aiLimiter, aiController.streamChat);

export default router;
