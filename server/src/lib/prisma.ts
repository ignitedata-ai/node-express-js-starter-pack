import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../config/env';
import { getLogger } from './logger';
import { dbQueryDuration } from './metrics';

const SLOW_QUERY_MS = parseInt(process.env.SLOW_QUERY_MS ?? '200', 10);

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        try {
          const result = await query(args);
          const duration = Math.round(performance.now() - start);

          dbQueryDuration.observe({ model: model ?? 'unknown', operation }, duration);

          if (duration >= SLOW_QUERY_MS) {
            getLogger({ model, operation, duration }).warn('Slow DB query');
          } else {
            getLogger({ model, operation, duration }).debug('DB query');
          }

          return result;
        } catch (err) {
          const duration = Math.round(performance.now() - start);
          getLogger({ model, operation, duration }).error({ err }, 'DB query failed');
          throw err;
        }
      },
    },
  },
});

export default prisma;
