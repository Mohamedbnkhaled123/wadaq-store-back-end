import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { env } from '../config/env';

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'حدث خطأ داخلي في الخادم';

  if (statusCode === 500) {
    console.error('[Internal Server Error]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
