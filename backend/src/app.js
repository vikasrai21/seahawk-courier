// src/app.js — Express application setup
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');
const config       = require('./config');
const logger       = require('./utils/logger');
const { globalErrorHandler } = require('./middleware/errorHandler');
const R = require('./utils/response');

const app = express();

// ── Trust proxy (required for correct IP behind nginx/load balancer) ─────
app.set('trust proxy', 1);

// ── Security headers ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: config.isProd ? undefined : false, // Strict in prod, loose in dev
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      config.cors.origin,
  credentials: true,               // Required for cookies
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── No global rate limiting — internal office tool
// Re-enable if you deploy this publicly to the internet



// ── HTTP access logging (using Winston stream) ────────────────────────────
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

app.use(morgan(config.isProd ? 'combined' : 'dev', {
  stream: {
    write: (msg) => logger.http(msg.trim()),
  },
  skip: (req) => req.path === '/api/health', // Don't log health pings
}));

// ── Body parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check (no auth, no rate limit) ────────────────────────────────
app.get('/api/health', async (req, res) => {
  const prisma = require('./config/prisma');
  try {
    await prisma.$queryRaw`SELECT 1`;
    R.ok(res, {
      status:   'healthy',
      database: 'connected',
      uptime:   Math.floor(process.uptime()),
      env:      config.env,
      version:  '2.0.0',
    });
  } catch (err) {
    logger.error('Health check failed', { error: err.message });
    res.status(503).json({ success: false, status: 'unhealthy', database: 'disconnected' });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth.routes'));
app.use('/api/shipments',      require('./routes/shipment.routes'));
app.use('/api/clients',        require('./routes/client.routes'));
app.use('/api/contracts',      require('./routes/contract.routes'));
app.use('/api/invoices',       require('./routes/invoice.routes'));
app.use('/api/audit',          require('./routes/audit.routes'));
app.use('/api/quotes',         require('./routes/quote.routes'));
app.use('/api/reconciliation', require('./routes/reconciliation.routes'));
app.use('/api/rates',          require('./routes/rates.routes'));
app.use('/api/ops',            require('./routes/ops.routes'));

// ── Serve React build in production ──────────────────────────────────────
const frontendBuild = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild, { maxAge: config.isProd ? '1d' : 0 }));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuild, 'index.html'));
    }
  });
}

// ── 404 for unknown API routes ────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  R.error(res, `Route ${req.method} ${req.path} not found`, 404);
});

// ── Global error handler — MUST be last ──────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
