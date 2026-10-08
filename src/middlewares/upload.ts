import multer from 'multer';
import { ApiError } from '../utils/api-error';

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'صيغة الصورة غير مدعومة. الصيغ المسموحة: JPEG, PNG, WebP'));
    }
  },
});
