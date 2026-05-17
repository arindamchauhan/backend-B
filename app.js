import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'order-invoice-backend',
      storage: 'mongodb',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api', orderRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.originalUrl,
    });
  });

  app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    console.error('[server:error]', err);

    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  });

  return app;
}

export default createApp;
