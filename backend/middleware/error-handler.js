const { getLogger } = require('../lib/logger');

function errorHandler(err, req, res, next) {
  const logger = getLogger();
  
  // Log the error
  logger.error('Unhandled error', {
    requestId: req.id,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    ip: req.ip
  });
  
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    requestId: req.id || 'unknown',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details 
    })
  });
}

function notFoundHandler(req, res) {
  const logger = getLogger();
  
  logger.warn('Route not found', {
    requestId: req.id,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFoundHandler, asyncHandler };
