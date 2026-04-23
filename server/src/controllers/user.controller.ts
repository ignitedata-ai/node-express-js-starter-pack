import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { NotFoundError } from '../errors';
import { asyncHandler } from '../utils/asyncHandler';
import { userRepository } from '../repositories';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userRepository.findById(req.user!.sub);
  if (!user) throw new NotFoundError('User');
  res.json(ApiResponse.ok(user.toPublic()));
});
