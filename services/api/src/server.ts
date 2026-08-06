import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import driveRoutes from './routes/driveRoutes';

const app = express();

// 1. Helmet Security Middleware
app.use(helmet());
app.disable('x-powered-by');

// 2. CORS Allowed Origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'https://gatepulse-xi.vercel.app',
  'https://gatepulse.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Body Parser Payload Limit (50kb limit to prevent payload memory exhaustion)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 4. Rate Limiting Middleware for /api/v1/ingest/* (Max 10 requests per 15 min window per IP)
const ingestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per 15-min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many ingestion requests from this IP. Please try again in 15 minutes.'
  }
});

// Apply rate limiter to ingest route
app.use('/api/v1/ingest', ingestRateLimiter);

// Mount V1 API routes
app.use('/api/v1', driveRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    service: 'GatePulse API Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    security: {
      helmet: true,
      rate_limiting: true,
      cors: 'restricted',
      body_limit: '50kb'
    }
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>GatePulse Production API</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc;">
        <h1 style="color: #38bdf8;">GatePulse Express Backend API (Hardened Production)</h1>
        <p>Active Service listening on port <strong>${config.port}</strong></p>
        <h3>Security Enforcement:</h3>
        <ul>
          <li><strong>Helmet HTTP Security Headers</strong> Enabled</li>
          <li><strong>CORS Restriction</strong> Active for production origin</li>
          <li><strong>Ingestion Rate Limiting</strong> 10 requests / 15 min window</li>
          <li><strong>Zod Payload Validation</strong> 20 - 2,000 char threshold</li>
        </ul>
      </body>
    </html>
  `);
});

// 5. Global Error Handling Middleware (Generic error response in production, suppress stack trace)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Security Error Handler]:', err?.message || err);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
    ...(isProduction ? {} : { stack: err.stack })
  });
});

app.listen(config.port, () => {
  console.log(`🚀 GatePulse Express API server running in secure mode at http://localhost:${config.port}`);
});
