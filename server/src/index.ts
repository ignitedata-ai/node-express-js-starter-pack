import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cargoRoutes from './routes/cargo.routes';
import { errorHandler } from './middleware/errorHandler';
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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cargo', cargoRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received — shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled promise rejection:', reason);
  server.close(async () => { await prisma.$disconnect(); process.exit(1); });
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught exception:', err);
  server.close(async () => { await prisma.$disconnect(); process.exit(1); });
});
