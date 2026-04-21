export enum ErrorCode {
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  EMAIL_TAKEN = 'EMAIL_TAKEN',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  /** true = expected operational error (4xx, known 5xx); false = programmer bug */
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    isOperational = true,
    details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
