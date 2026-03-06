const winston = require('winston');

let logger = null;

function createLogger() {
  if (logger) return logger;
  
  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ];
  
  // Add file transport in production
  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        format: winston.format.json()
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        format: winston.format.json()
      })
    );
  }
  
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports
  });
  
  return logger;
}

function getLogger() {
  return createLogger();
}

module.exports = { getLogger };
