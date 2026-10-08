import { Router } from 'express';
import { uploadSingleImage, deleteImage } from './uploads.controller';
import { uploadImage } from '../../middlewares/upload';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

router.post('/', requireAdmin, uploadImage.single('image'), uploadSingleImage);
router.delete('/:publicId', requireAdmin, deleteImage);

export default router;
