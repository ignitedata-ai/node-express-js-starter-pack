import bcrypt from 'bcryptjs';
import prisma from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthenticationError, ConflictError, ErrorCode } from '../errors';
import type { RegisterRequest, LoginRequest, LoginResponse } from '../types/auth.types';

function toPublicUser(user: { id: string; email: string; name: string; role: string; createdAt: Date }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role as 'user' | 'admin', createdAt: user.createdAt.toISOString() };
}

function buildTokens(user: { id: string; email: string; role: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role as 'user' | 'admin' };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

export async function register(body: RegisterRequest): Promise<LoginResponse> {
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new ConflictError('Email already registered', ErrorCode.EMAIL_TAKEN);

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({ data: { email: body.email, name: body.name, passwordHash } });

  const { accessToken, refreshToken } = buildTokens(user);
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

  return { accessToken, user: toPublicUser(user) };
}

export async function login(body: LoginRequest): Promise<LoginResponse & { refreshToken: string }> {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw new AuthenticationError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) throw new AuthenticationError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);

  const { accessToken, refreshToken } = buildTokens(user);
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function refresh(token: string): Promise<{ accessToken: string; user: ReturnType<typeof toPublicUser> }> {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AuthenticationError('Invalid refresh token', ErrorCode.TOKEN_INVALID);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.refreshToken) throw new AuthenticationError('Session expired', ErrorCode.SESSION_EXPIRED);

  const valid = await bcrypt.compare(token, user.refreshToken);
  if (!valid) throw new AuthenticationError('Invalid refresh token', ErrorCode.TOKEN_INVALID);

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { accessToken, user: toPublicUser(user) };
}

export async function logout(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}
