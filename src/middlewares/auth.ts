import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/api-error';

export interface AdminPayload {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  admin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token =
      req.cookies?.wadaq_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return next(ApiError.unauthorized('يجب تسجيل الدخول كمسؤول أولاً'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.admin !== true)) {
      return next(ApiError.forbidden('صلاحيات غير كافية'));
    }

    // Normalize id
    if (!decoded.id && decoded.sub) {
      decoded.id = decoded.sub;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return next(ApiError.unauthorized('جلسة الدخول منتهية أو غير صالحة'));
  }
}
