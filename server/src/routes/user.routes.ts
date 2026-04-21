import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ApiResponse } from '../utils/ApiResponse';
import prisma from '../models/User';

const router = Router();

router.get('/me', authenticate, async (req: Request, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json(ApiResponse.fail('User not found'));
    const { passwordHash, refreshToken, ...safe } = user;
    res.json(ApiResponse.ok({ ...safe, createdAt: safe.createdAt.toISOString() }));
  } catch (err) {
    next(err);
  }
});

router.get('/public-me', async (req: Request, res: Response, next) => {
 res.json(ApiResponse.ok({ message: { id: 1, name: 'Madhuri'} }));
});

export default router;