import { Router } from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from './projects.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

// Public
router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);

// Admin
router.post('/', requireAdmin, createProject);
router.put('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

export default router;
