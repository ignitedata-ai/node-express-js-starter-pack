import { AppError, ErrorCode } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized', errorCode: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(message, 401, errorCode, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, ErrorCode.NOT_FOUND, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.CONFLICT) {
    super(message, 409, errorCode, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error', details?: unknown) {
    super(message, 500, ErrorCode.DATABASE_ERROR, true, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, ErrorCode.SERVICE_UNAVAILABLE, true);
  }
}
