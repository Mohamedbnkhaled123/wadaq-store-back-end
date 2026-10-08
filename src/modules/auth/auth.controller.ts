import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/admin.model';
import { ApiError } from '../../utils/api-error';
import { env } from '../../config/env';

/**
 * Checks if initial admin account exists in database.
 */
export async function getSetupStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await Admin.findOne({}, 'email name createdAt').lean();
    res.json({
      success: true,
      data: {
        isInitialized: !!admin,
        adminEmail: admin ? admin.email : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates initial admin user when no admin exists in the database.
 */
export async function setup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existingCount = await Admin.countDocuments();
    if (existingCount > 0 && !req.admin) {
      return next(ApiError.forbidden('تم إنشاء حساب المسؤول مسبقاً. يرجى تسجيل الدخول.'));
    }

    const { email, password, name } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest('برجاء إدخال البريد الإلكتروني وكلمة المرور'));
    }

    if (typeof password !== 'string' || password.length < 8) {
      return next(ApiError.badRequest('كلمة المرور يجب أن لا تقل عن 8 أحرف وأرقام'));
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return next(ApiError.badRequest('هذا البريد الإلكتروني مسجل بالفعل'));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name: name?.trim() || 'Admin',
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'admin',
    });

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        sub: admin._id.toString(),
        name: admin.name || 'Admin',
        email: admin.email,
        role: admin.role,
        admin: true,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = env.NODE_ENV === 'production';

    res.cookie('wadaq_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب المسؤول وتعيين كلمة المرور بنجاح',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Standard Admin Login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest('برجاء إدخال البريد الإلكتروني وكلمة المرور'));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return next(ApiError.unauthorized('بيانات الدخول غير صحيحة'));
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('بيانات الدخول غير صحيحة'));
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        sub: admin._id.toString(),
        name: admin.name || admin.email.split('@')[0],
        email: admin.email,
        role: admin.role,
        admin: true,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = env.NODE_ENV === 'production';

    res.cookie('wadaq_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change Admin Password
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.admin?.id || req.admin?.sub;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(ApiError.badRequest('برجاء إدخال كلمة المرور الحالية والجديدة'));
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return next(ApiError.badRequest('كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف وأرقام'));
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return next(ApiError.notFound('حساب المسؤول غير موجود'));
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return next(ApiError.badRequest('كلمة المرور الحالية غير صحيحة'));
    }

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح',
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('wadaq_token', {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });

  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: {
      admin: req.admin,
    },
  });
}
