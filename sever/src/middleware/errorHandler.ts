import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      ...ApiResponse.fail(err.message),
      code: err.statusCode,
    });
  }

  if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(500).json({
    ...ApiResponse.fail('Internal server error'),
    code: 500,
  });
}
