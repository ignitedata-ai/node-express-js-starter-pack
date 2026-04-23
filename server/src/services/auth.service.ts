import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthenticationError, ConflictError, ErrorCode } from '../errors';
import { userRepository } from '../repositories';
import type { RegisterRequest, LoginRequest, LoginResponse } from '../types/auth.types';
import type { PublicUser } from '../models/User.model';

function buildTokens(userId: string, email: string, role: string) {
  const payload = { sub: userId, email, role: role as 'user' | 'admin' };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

export async function register(body: RegisterRequest): Promise<LoginResponse> {
  const existing = await userRepository.findByEmail(body.email);
  if (existing) throw new ConflictError('Email already registered', ErrorCode.EMAIL_TAKEN);

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await userRepository.create({ email: body.email, name: body.name, passwordHash });

  const { accessToken, refreshToken } = buildTokens(user.id, user.email, user.role);
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await userRepository.update(user.id, { refreshToken: hashedRefresh });

  return { accessToken, user: user.toPublic() };
}

export async function login(body: LoginRequest): Promise<LoginResponse & { refreshToken: string }> {
  const user = await userRepository.findByEmail(body.email);
  if (!user) throw new AuthenticationError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) throw new AuthenticationError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);

  const { accessToken, refreshToken } = buildTokens(user.id, user.email, user.role);
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await userRepository.update(user.id, { refreshToken: hashedRefresh });

  return { accessToken, refreshToken, user: user.toPublic() };
}

export async function refresh(token: string): Promise<{ accessToken: string; user: PublicUser }> {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AuthenticationError('Invalid refresh token', ErrorCode.TOKEN_INVALID);
  }

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.hasRefreshToken()) throw new AuthenticationError('Session expired', ErrorCode.SESSION_EXPIRED);

  const valid = await bcrypt.compare(token, user.refreshToken!);
  if (!valid) throw new AuthenticationError('Invalid refresh token', ErrorCode.TOKEN_INVALID);

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { accessToken, user: user.toPublic() };
}

export async function logout(userId: string): Promise<void> {
  await userRepository.update(userId, { refreshToken: null });
}
