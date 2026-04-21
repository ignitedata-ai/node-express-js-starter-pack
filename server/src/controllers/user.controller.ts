import { Request, Response } from 'express';
import prisma from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { NotFoundError } from '../errors';
import { asyncHandler } from '../utils/asyncHandler';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw new NotFoundError('User');
  const { passwordHash, refreshToken, ...safe } = user;
  res.json(ApiResponse.ok({ ...safe, createdAt: safe.createdAt.toISOString() }));
});
