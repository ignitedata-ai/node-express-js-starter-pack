import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError, ErrorCode, ValidationError, NotFoundError, ConflictError, DatabaseError } from '../errors';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

function fromPrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002':
      return new ConflictError('A record with this value already exists', ErrorCode.CONFLICT);
    case 'P2025':
      return new NotFoundError('Record');
    case 'P2003':
      return new ValidationError('Invalid reference: related record not found');
    case 'P2000':
      return new ValidationError('Input value is too long for this field');
    default:
      return new DatabaseError(`Database error [${err.code}]`);
  }
}

function log(err: Error, req: Request): void {
  if (env.NODE_ENV === 'production') return;
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.name,
    message: err.message,
    stack: err.stack,
  });
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Already a typed AppError — use as-is
  if (err instanceof AppError) {
    log(err, req);
    res.status(err.statusCode).json(
      ApiResponse.fail(err.message, err.errorCode, err.details),
    );
    return;
  }

  // Prisma known request errors (constraint violations, not found, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const appErr = fromPrismaError(err);
    log(appErr, req);
    res.status(appErr.statusCode).json(
      ApiResponse.fail(appErr.message, appErr.errorCode),
    );
    return;
  }

  // Prisma validation errors (bad query shape)
  if (err instanceof Prisma.PrismaClientValidationError) {
    log(err, req);
    res.status(400).json(
      ApiResponse.fail('Invalid query parameters', ErrorCode.VALIDATION_ERROR),
    );
    return;
  }

  // JWT errors
  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json(
      ApiResponse.fail('Token has expired', ErrorCode.TOKEN_EXPIRED),
    );
    return;
  }
  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json(
      ApiResponse.fail('Invalid token', ErrorCode.TOKEN_INVALID),
    );
    return;
  }

  // Express body-parser: malformed JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json(
      ApiResponse.fail('Malformed JSON in request body', ErrorCode.VALIDATION_ERROR),
    );
    return;
  }

  // Unknown / unexpected errors
  log(err, req);
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json(
    ApiResponse.fail(message, ErrorCode.INTERNAL_ERROR),
  );
}
