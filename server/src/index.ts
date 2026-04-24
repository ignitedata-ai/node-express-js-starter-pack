import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cargoRoutes from './routes/cargo.routes';
import { errorHandler } from './middleware/errorHandler';
import { httpLogger } from './middleware/httpLogger';
import { logger } from './lib/logger';
import { registry } from './lib/metrics';
import prisma from './lib/prisma';

const app = express();

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cargo', cargoRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  server.close(async () => { await prisma.$disconnect(); process.exit(1); });
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught exception');
  server.close(async () => { await prisma.$disconnect(); process.exit(1); });
});
