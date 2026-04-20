export class ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;

  constructor(success: boolean, data: T | null, message: string) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  static ok<T>(data: T, message = 'OK'): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static fail(message: string): ApiResponse<null> {
    return new ApiResponse(false, null, message);
  }
}

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
