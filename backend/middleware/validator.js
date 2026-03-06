const { getLogger } = require('../lib/logger');

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

function validateRequired(fields) {
  return (req, res, next) => {
    const logger = getLogger();
    const missing = [];
    
    for (const field of fields) {
      if (!req.body[field]) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      logger.warn('Validation failed: missing required fields', {
        requestId: req.id,
        missing,
        body: req.body
      });
      
      return res.status(400).json({
        error: 'Missing required fields',
        missing,
        requestId: req.id
      });
    }
    
    next();
  };
}

function validateImageBase64(req, res, next) {
  const { imageBase64 } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({
      error: 'imageBase64 is required',
      requestId: req.id
    });
  }
  
  // Check if it's a valid base64 image
  const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  if (!base64Regex.test(imageBase64)) {
    return res.status(400).json({
      error: 'Invalid image format. Must be base64 encoded image',
      requestId: req.id
    });
  }
  
  // Check size (max 15MB)
  const sizeInBytes = (imageBase64.length * 3) / 4;
  const maxSize = 15 * 1024 * 1024; // 15MB
  
  if (sizeInBytes > maxSize) {
    return res.status(400).json({
      error: 'Image too large. Maximum size is 15MB',
      requestId: req.id
    });
  }
  
  next();
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateSubject(req, res, next) {
  const { subject } = req.body;
  
  if (!subject || subject.trim().length < 3) {
    return res.status(400).json({
      error: 'Subject must be at least 3 characters long',
      requestId: req.id
    });
  }
  
  // Check for invalid subjects
  const invalidSubjects = ['test', 'qwe', 'asd', 'abc', '123', 'asdf'];
  if (invalidSubjects.includes(subject.trim().toLowerCase())) {
    return res.status(400).json({
      error: 'Please enter a real subject name',
      requestId: req.id
    });
  }
  
  next();
}

module.exports = {
  ValidationError,
  validateRequired,
  validateImageBase64,
  validateEmail,
  validateSubject
};
