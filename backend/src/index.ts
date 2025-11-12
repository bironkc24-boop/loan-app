import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import loanRoutes from './routes/loans';
import adminRoutes from './routes/admin';
import riderRoutes from './routes/rider';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'QuickLoan API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      loans: '/api/loans',
      admin: '/api/admin',
      rider: '/api/rider',
      notifications: '/api/notifications'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rider', riderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = typeof config.port === 'string' ? parseInt(config.port) : config.port;
const HOST = 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔒 CORS enabled for: ${config.frontendUrl}`);
});

export default app;
