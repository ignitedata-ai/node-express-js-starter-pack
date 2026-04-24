import { Registry, Histogram, Counter } from 'prom-client';

export const registry = new Registry();
registry.setDefaultLabels({ app: 'nextdecade-server' });

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500],
  registers: [registry],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [registry],
});

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_ms',
  help: 'Database query duration in milliseconds',
  labelNames: ['model', 'operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500],
  registers: [registry],
});
