import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';
import { env } from '../config/env';

export interface RequestContext {
  correlationId: string;
  userId?: string;
}

export const requestStorage = new AsyncLocalStorage<RequestContext>();

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'nextdecade-server', env: env.NODE_ENV },
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname,service,env', translateTime: 'SYS:HH:MM:ss' },
    },
  }),
});

export function getLogger(bindings?: Record<string, unknown>) {
  const ctx = requestStorage.getStore();
  return logger.child({
    ...(ctx?.correlationId && { correlationId: ctx.correlationId }),
    ...(ctx?.userId && { userId: ctx.userId }),
    ...bindings,
  });
}
