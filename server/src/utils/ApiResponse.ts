export class ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errorCode?: string;
  details?: unknown;

  constructor(success: boolean, data: T | null, message: string, errorCode?: string, details?: unknown) {
    this.success = success;
    this.data = data;
    this.message = message;
    if (errorCode !== undefined) this.errorCode = errorCode;
    if (details !== undefined) this.details = details;
  }

  static ok<T>(data: T, message = 'OK'): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static fail(message: string, errorCode?: string, details?: unknown): ApiResponse<null> {
    return new ApiResponse(false, null, message, errorCode, details);
  }
}
