import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticationError } from '../errors';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.ok(result, 'Account created'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken, ...result } = await authService.login(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.json(ApiResponse.ok(result, 'Login successful'));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw new AuthenticationError('No refresh token provided');
  const result = await authService.refresh(token);
  res.json(ApiResponse.ok(result, 'Token refreshed'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.sub);
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json(ApiResponse.ok(null, 'Logged out'));
});
