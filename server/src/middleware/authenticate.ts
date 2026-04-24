import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthenticationError } from '../errors';
import { requestStorage } from '../lib/logger';
import type { AuthTokenPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AuthenticationError('No token provided'));
  try {
    req.user = verifyAccessToken(token);
    const ctx = requestStorage.getStore();
    if (ctx) ctx.userId = req.user.sub;
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired token'));
  }
}
