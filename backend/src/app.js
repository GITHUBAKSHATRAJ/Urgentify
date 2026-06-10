const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Request logging middleware (simple console logger)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  }
  next();
});

// Configure CORS to support Chrome extension and other dynamic origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Body parser
app.use(express.json());

// API health status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SyncTask API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Fallback 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found - ${req.originalUrl}`
  });
});

// Global error handler middleware
app.use(errorHandler);

module.exports = app;
