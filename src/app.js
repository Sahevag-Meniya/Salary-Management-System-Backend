const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import routes
const salaryRoutes = require('./routes/salaryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/salaries', salaryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Salary Management System API (Sequelize + MySQL)',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      salaries: '/api/salaries',
      analytics: '/api/analytics',
      reports: '/api/reports'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.name || 'ServerError',
    message: err.message || 'An unexpected error occurred'
  });
});

module.exports = app;
