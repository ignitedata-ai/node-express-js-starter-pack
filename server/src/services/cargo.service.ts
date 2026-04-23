import { cargoRepository } from '../repositories';
import type { PaginationQuery, PaginatedMeta } from '../types/common.types';
import type { CargoResponse } from '../types/cargo.types';

export async function getAllCargo(
  query: PaginationQuery,
): Promise<{ items: CargoResponse[]; meta: PaginatedMeta }> {
  const { rows, meta } = await cargoRepository.findAllPaginated(query);
  return { items: rows.map(c => c.toJSON()), meta };
}
