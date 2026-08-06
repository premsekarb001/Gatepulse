import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import driveRoutes from './routes/driveRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount V1 API routes
app.use('/api/v1', driveRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'GatePulse API Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      has_gemini_key: Boolean(config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here'),
      has_supabase_url: Boolean(config.supabaseUrl && config.supabaseUrl !== 'https://your-supabase-project.supabase.co')
    }
  });
});

app.get('/', (_req, res) => {
  res.send(`
    <html>
      <head><title>GatePulse API Server</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc;">
        <h1 style="color: #38bdf8;">GatePulse Express Backend API v1</h1>
        <p>Active Service listening on port <strong>${config.port}</strong></p>
        <h3>Endpoints:</h3>
        <ul>
          <li><code>POST /api/v1/ingest/parse-and-save</code> - Parse raw job notice text with Gemini 1.5 Flash &amp; save to Supabase</li>
          <li><code>GET /api/v1/drives</code> - Get active walk-in drives sorted by walkin_start_date</li>
          <li><code>GET /health</code> - Service health check</li>
        </ul>
      </body>
    </html>
  `);
});

app.listen(config.port, () => {
  console.log(`🚀 GatePulse Express API server running at http://localhost:${config.port}`);
});
