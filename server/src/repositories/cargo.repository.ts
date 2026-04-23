import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { CargoModel } from '../models/Cargo.model';
import { BaseRepository } from './base.repository';
import { buildPaginatedMeta, type PaginationQuery, type PaginatedMeta } from '../types/common.types';

export class CargoRepository extends BaseRepository<CargoModel> {
  async findById(id: string): Promise<CargoModel | null> {
    const row = await prisma.cargo.findUnique({ where: { id }, include: { emissionSummary: true } });
    return row ? new CargoModel(row) : null;
  }

  async findByCargoId(cargoId: string): Promise<CargoModel | null> {
    const row = await prisma.cargo.findUnique({ where: { cargoId }, include: { emissionSummary: true } });
    return row ? new CargoModel(row) : null;
  }

  async findAllPaginated(query: PaginationQuery): Promise<{ rows: CargoModel[]; meta: PaginatedMeta }> {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.cargo.findMany({
        take: limit,
        skip: offset,
        orderBy: { loadingDate: 'desc' },
        include: { emissionSummary: true },
      }),
      prisma.cargo.count(),
    ]);

    return { rows: rows.map(r => new CargoModel(r)), meta: buildPaginatedMeta(total, limit, offset) };
  }

  async create(data: Prisma.CargoCreateInput): Promise<CargoModel> {
    const row = await prisma.cargo.create({ data, include: { emissionSummary: true } });
    return new CargoModel(row);
  }

  async update(id: string, data: Prisma.CargoUpdateInput): Promise<CargoModel> {
    const row = await prisma.cargo.update({ where: { id }, data, include: { emissionSummary: true } });
    return new CargoModel(row);
  }

  async delete(id: string): Promise<CargoModel> {
    const row = await prisma.cargo.delete({ where: { id } });
    return new CargoModel(row);
  }

  async count(): Promise<number> {
    return prisma.cargo.count();
  }
}

export const cargoRepository = new CargoRepository();
