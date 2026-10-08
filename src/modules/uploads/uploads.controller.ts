import { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../../config/cloudinary';
import { ApiError } from '../../utils/api-error';
import { env } from '../../config/env';

export async function uploadSingleImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('يرجى اختيار ملف صورة للرفع'));
    }

    // Check if Cloudinary is configured
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      res.json({
        success: true,
        data: {
          url: base64,
          publicId: `dev_fallback_${Date.now()}`,
        },
      });
      return;
    }

    const folder = (req.query.folder as string) || 'wadaq_store/products';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        quality: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return next(ApiError.internal('فشل في رفع الصورة إلى السحابة'));
        }

        res.json({
          success: true,
          message: 'تم رفع الصورة بنجاح',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
          },
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawPublicId = Array.isArray(req.params.publicId) ? req.params.publicId[0] : req.params.publicId;
    const publicId = String(rawPublicId || '').trim();

    if (!publicId) {
      return next(ApiError.badRequest('معرف الصورة مطلوب'));
    }

    if (env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({
      success: true,
      message: 'تم حذف الصورة بنجاح',
    });
  } catch (error) {
    next(error);
  }
}
