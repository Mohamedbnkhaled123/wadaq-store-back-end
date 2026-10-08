import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getSetupStatus, setup, login, logout, getMe, changePassword, emergencyResetPassword } from './auth.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

// Rate limiter for login & setup attempts: 15 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى المحاولة بعد 15 دقيقة.',
  },
});

router.get('/setup-status', getSetupStatus);
router.post('/setup', authLimiter, setup);
router.post('/login', authLimiter, login);
router.post('/reset-admin-password', emergencyResetPassword);
router.post('/logout', logout);
router.get('/me', requireAdmin, getMe);
router.post('/change-password', requireAdmin, changePassword);

export default router;
