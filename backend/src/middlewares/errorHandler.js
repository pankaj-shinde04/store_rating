/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.error = 'Validation Error';
    error.message = 'Invalid input data';
    error.details = err.details;
    return res.status(400).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid Token';
    error.message = 'The provided token is invalid';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token Expired';
    error.message = 'Your session has expired, please login again';
    return res.status(401).json(error);
  }

  if (err.name === 'CastError') {
    error.error = 'Invalid Data Format';
    error.message = 'Invalid data format provided';
    return res.status(400).json(error);
  }

  // Handle MySQL errors
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        error.error = 'Duplicate Entry';
        error.message = 'A record with this value already exists';
        if (err.sqlMessage.includes('email')) {
          error.message = 'Email address already exists';
        }
        return res.status(409).json(error);
      
      case 'ER_NO_REFERENCED_ROW_2':
        error.error = 'Reference Error';
        error.message = 'Referenced record does not exist';
        return res.status(400).json(error);
      
      case 'ER_BAD_NULL_ERROR':
        error.error = 'Required Field Missing';
        error.message = 'A required field is missing';
        return res.status(400).json(error);
      
      case 'ER_DATA_TOO_LONG':
        error.error = 'Data Too Long';
        error.message = 'Provided data exceeds maximum length';
        return res.status(400).json(error);
      
      default:
        error.error = 'Database Error';
        error.message = 'A database error occurred';
        return res.status(500).json(error);
    }
  }

  // Handle custom application errors
  if (err.isOperational) {
    error.error = err.error || 'Application Error';
    error.message = err.message;
    return res.status(err.statusCode || 500).json(error);
  }

  // Default to 500 for unknown errors
  return res.status(500).json(error);
};

/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, error = 'Application Error') {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};
