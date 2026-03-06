const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const requestLogger = require('./middleware/request-logger');
const { getLogger } = require('./lib/logger');
const { getAWSCredentials } = require('./lib/aws-config');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET','POST'] }
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '15mb' }));

// Attach io to requests
app.use((req, res, next) => { 
  req.io = io; 
  next();
});

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/session', require('./routes/session'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/debug', require('./routes/debug'));

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// WebSocket
io.on('connection', (socket) => {
  const logger = getLogger();
  logger.info('WebSocket client connected', { socketId: socket.id });
  
  socket.on('join_room', (teacherId) => {
    socket.join(teacherId);
    logger.info('Teacher joined room', { teacherId, socketId: socket.id });
  });
  
  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });
});

const PORT = process.env.PORT || 3001;

// Graceful startup
(async () => {
  const logger = getLogger();
  
  try {
    logger.info('🚀 Starting Vibelytics backend...');
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   Port: ${PORT}`);
    
    // Test AWS connection
    await getAWSCredentials();
    logger.info('✅ AWS credentials loaded successfully');
    
    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`✅ Server running on http://localhost:${PORT}`);
      logger.info(`   Health check: http://localhost:${PORT}/health`);
      logger.info('');
      logger.info('📊 Available endpoints:');
      logger.info('   POST /api/auth/login');
      logger.info('   POST /api/session/start');
      logger.info('   POST /api/session/end');
      logger.info('   POST /api/analyze/frame');
      logger.info('   GET  /api/reports/summary');
      logger.info('');
    });
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  const logger = getLogger();
  logger.info('SIGTERM received, shutting down gracefully...');
  
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  const logger = getLogger();
  logger.info('SIGINT received, shutting down gracefully...');
  
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = getLogger();
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = getLogger();
  logger.error('Unhandled promise rejection', {
    reason: reason,
    promise: promise
  });
});
