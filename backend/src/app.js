import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import porterRoutes from './routes/porter.routes.js';
import carrierRoutes from './routes/carrier.routes.js';
import locationRoutes from './routes/location.routes.js';
import commuteCostRoutes from './routes/commuteCost.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import activityRoutes from './routes/activity.routes.js';
import documentRoutes from './routes/document.routes.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple frontend ports
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Porter Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/porters', porterRoutes);
app.use('/api/carriers', carrierRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/commute-costs', commuteCostRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
