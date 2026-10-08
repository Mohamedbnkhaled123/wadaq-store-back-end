import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
  restoreProduct,
  permanentDeleteProduct,
} from './products.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

// Public
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);

// Admin
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.patch('/:id/toggle', requireAdmin, toggleProduct);
router.delete('/:id', requireAdmin, deleteProduct);
router.patch('/:id/restore', requireAdmin, restoreProduct);
router.delete('/:id/permanent', requireAdmin, permanentDeleteProduct);

export default router;
