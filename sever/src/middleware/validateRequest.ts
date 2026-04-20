import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiResponse';

type Schema = {
  body?: Record<string, 'string' | 'email'>;
};

export function validateRequest(schema: Schema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) {
      for (const [field, type] of Object.entries(schema.body)) {
        const value = (req.body as Record<string, unknown>)[field];
        if (value === undefined || value === null || value === '') {
          return next(new ApiError(400, `${field} is required`));
        }
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          return next(new ApiError(400, `${field} must be a valid email`));
        }
      }
    }
    next();
  };
}
