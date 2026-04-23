import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { UserModel } from '../models/User.model';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<UserModel> {
  async findById(id: string): Promise<UserModel | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? new UserModel(row) : null;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? new UserModel(row) : null;
  }

  async create(data: Prisma.UserCreateInput): Promise<UserModel> {
    const row = await prisma.user.create({ data });
    return new UserModel(row);
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserModel> {
    const row = await prisma.user.update({ where: { id }, data });
    return new UserModel(row);
  }

  async delete(id: string): Promise<UserModel> {
    const row = await prisma.user.delete({ where: { id } });
    return new UserModel(row);
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }
}

export const userRepository = new UserRepository();
