import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/timezone';

import authRoutes from './modules/auth/auth.routes';
import educationRoutes from './modules/education/education.routes';
import enrollmentRoutes from './modules/enrollment/enrollment.routes';
import serviceRequestRoutes from './modules/service-request/service-request.routes';

import { EducationController } from './modules/education/education.controller';
import { EnrollmentController } from './modules/enrollment/enrollment.controller';
import { validate } from './middlewares/validate.middleware';
import { scheduleGenerateSchema } from './modules/education/education.schema';
import { invoiceCalcSchema } from './modules/enrollment/enrollment.schema';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Education & Tech Service Management API',
    status: 'ONLINE',
    timezone: 'Asia/Ho_Chi_Minh',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

app.post(
  '/schedule/generate',
  validate(scheduleGenerateSchema),
  EducationController.calculateSchedule
);

app.post(
  '/invoice/calc',
  validate(invoiceCalcSchema),
  EnrollmentController.calculateInvoice
);

app.use('/api/auth', authRoutes);
app.use('/api', educationRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', serviceRequestRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message && err.status === 400 ? err.message : 'An internal server error occurred',
    },
  });
});

export default app;
