import type { PaginatedMeta } from '../types/common.types';

export class ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errorCode?: string;
  details?: unknown;
  meta?: PaginatedMeta;

  constructor(
    success: boolean,
    data: T | null,
    message: string,
    errorCode?: string,
    details?: unknown,
    meta?: PaginatedMeta,
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    if (errorCode !== undefined) this.errorCode = errorCode;
    if (details !== undefined) this.details = details;
    if (meta !== undefined) this.meta = meta;
  }

  static ok<T>(data: T, message = 'OK'): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static paginated<T>(data: T[], meta: PaginatedMeta, message = 'OK'): ApiResponse<T[]> {
    return new ApiResponse(true, data, message, undefined, undefined, meta);
  }

  static fail(message: string, errorCode?: string, details?: unknown): ApiResponse<null> {
    return new ApiResponse(false, null, message, errorCode, details);
  }
}
