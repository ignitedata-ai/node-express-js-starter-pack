export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface PaginatedMeta {
  total: number;
  limit: number;
  offset: number;
  current_page: number;
  total_pages: number;
  has_more: boolean;
}

export type SortOrder = 'asc' | 'desc';

export function buildPaginatedMeta(total: number, limit: number, offset: number): PaginatedMeta {
  const total_pages = Math.ceil(total / limit);
  const current_page = Math.floor(offset / limit) + 1;
  return {
    total,
    limit,
    offset,
    current_page,
    total_pages,
    has_more: offset + limit < total,
  };
}
