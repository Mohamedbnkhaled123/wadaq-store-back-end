export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'غير مصرح لك بالدخول'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'غير مسموح لك بتنفيذ هذا الإجراء'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'العنصر المطلوب غير موجود'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = 'حدث خطأ غير متوقع في الخادم'): ApiError {
    return new ApiError(500, message);
  }
}
