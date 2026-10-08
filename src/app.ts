import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env';
import { ApiError } from './utils/api-error';
import { errorHandler } from './middlewares/error-handler';

// Routes
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/categories.routes';
import productRoutes from './modules/products/products.routes';
import packageRoutes from './modules/packages/packages.routes';
import projectRoutes from './modules/projects/projects.routes';
import settingsRoutes from './modules/settings/settings.routes';
import uploadRoutes from './modules/uploads/uploads.routes';
import adminStatsRoutes from './modules/admin-stats.routes';
import aiRoutes from './modules/ai/ai.routes';

const app = express();

// Security & Optimization middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, SSR server calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev / flexible domain
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Wadaq Store API',
  });
});

// Mount modules
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/uploads', uploadRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api', adminStatsRoutes); // Exposes /api/sitemap-data directly

// Catch-all 404 for undefined routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound('المسار المطلوب غير موجود في واجهة برمجة التطبيقات'));
});

// Central error handler
app.use(errorHandler);

export { app };
