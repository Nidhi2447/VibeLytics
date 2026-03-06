const { getLogger } = require('../lib/logger');
const { v4: uuidv4 } = require('uuid');

function requestLogger(req, res, next) {
  const logger = getLogger();
  
  // Generate request ID
  req.id = uuidv4();
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Capture response time
  const startTime = Date.now();
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const logLevel = res.statusCode >= 500 ? 'error' 
                   : res.statusCode >= 400 ? 'warn' 
                   : 'info';
    
    logger[logLevel]('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });
  });
  
  next();
}

module.exports = requestLogger;
