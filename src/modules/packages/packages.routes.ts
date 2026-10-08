import { Router } from 'express';
import {
  getPackages,
  getPackageBySlug,
  createPackage,
  updatePackage,
  togglePackage,
  deletePackage,
} from './packages.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

// Public
router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);

// Admin
router.post('/', requireAdmin, createPackage);
router.put('/:id', requireAdmin, updatePackage);
router.patch('/:id/toggle', requireAdmin, togglePackage);
router.delete('/:id', requireAdmin, deletePackage);

export default router;
