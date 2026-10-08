import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { env } from '../config/env';

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  let message = err.message;
  if (!isApiError && statusCode === 500) {
    console.error('[Internal Server Error]:', err);
    message = 'تعذر الاتصال بالخادم حالياً، يرجى المحاولة بعد قليل';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
