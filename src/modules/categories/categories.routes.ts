import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
  restoreCategory,
} from './categories.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

// Public
router.get('/', getCategories);

// Admin
router.post('/', requireAdmin, createCategory);
router.put('/:id', requireAdmin, updateCategory);
router.patch('/:id/toggle', requireAdmin, toggleCategory);
router.delete('/:id', requireAdmin, deleteCategory);
router.patch('/:id/restore', requireAdmin, restoreCategory);

export default router;
