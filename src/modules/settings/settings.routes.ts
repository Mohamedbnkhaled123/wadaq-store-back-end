import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

router.get('/', getSettings);
router.put('/', requireAdmin, updateSettings);

export default router;
