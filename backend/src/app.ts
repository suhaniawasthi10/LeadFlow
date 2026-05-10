import express, { Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import leadsRouter from './routes/leads';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api/leads', leadsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
