import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to forward rejected promises to Express error middleware.
 * Eliminates the need for try/catch in every controller.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
