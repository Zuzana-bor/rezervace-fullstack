import { Response } from 'express';

// Standardizované API odpovědi
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    error?: string,
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, message: string, data?: T) {
    return this.success(res, message, data, 201);
  }

  static notFound(res: Response, message = 'Zdroj nenalezen') {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message = 'Neplatné požadavky') {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message = 'Neautorizovaný přístup') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Zakázaný přístup') {
    return this.error(res, message, 403);
  }
}
