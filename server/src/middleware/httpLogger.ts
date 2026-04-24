import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestStorage, getLogger } from '../lib/logger';
import { httpRequestDuration, httpRequestTotal } from '../lib/metrics';

const SLOW_REQUEST_MS = parseInt(process.env.SLOW_REQUEST_MS ?? '1000', 10);

export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  const start = performance.now();

  res.setHeader('x-request-id', correlationId);

  requestStorage.run({ correlationId }, () => {
    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      const route = (req.route?.path as string | undefined) ?? req.path;
      const status = res.statusCode;
      const method = req.method;

      httpRequestDuration.observe({ method, route, status: String(status) }, duration);
      httpRequestTotal.inc({ method, route, status: String(status) });

      const log = getLogger({ method, route, status, duration });

      if (status >= 500)            log.error(`${method} ${route} ${status} ${duration}ms`);
      else if (status >= 400)       log.warn(`${method} ${route} ${status} ${duration}ms`);
      else if (duration > SLOW_REQUEST_MS) log.warn({ slow: true }, `${method} ${route} ${status} ${duration}ms`);
      else                          log.info(`${method} ${route} ${status} ${duration}ms`);
    });

    next();
  });
}
