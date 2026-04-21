import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

type FieldType = 'string' | 'email';
type Schema = {
  body?: Record<string, FieldType>;
};

export function validateRequest(schema: Schema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schema.body) {
      for (const [field, type] of Object.entries(schema.body)) {
        const value = (req.body as Record<string, unknown>)[field];
        if (value === undefined || value === null || value === '') {
          return next(new ValidationError(`${field} is required`));
        }
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          return next(new ValidationError(`${field} must be a valid email`));
        }
      }
    }
    next();
  };
}
