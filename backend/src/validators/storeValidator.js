const { body, validationResult } = require('express-validator');

/**
 * Validate store creation
 */
const validateStoreCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,'()]+$/)
    .withMessage('Store name can only contain letters, numbers, spaces, and basic punctuation'),
  
  body('address')
    .trim()
    .isLength({ min: 10, max: 400 })
    .withMessage('Address must be between 10 and 400 characters')
    .matches(/^[a-zA-Z0-9\s\-.,#()]+$/)
    .withMessage('Address contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: false })
    .withMessage('Invalid website URL'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s\-&]+$/)
    .withMessage('Category contains invalid characters'),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }
    next();
  }
];

/**
 * Validate store update
 */
const validateStoreUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,'()]+$/)
    .withMessage('Store name can only contain letters, numbers, spaces, and basic punctuation'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 400 })
    .withMessage('Address must be between 10 and 400 characters')
    .matches(/^[a-zA-Z0-9\s\-.,#()]+$/)
    .withMessage('Address contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: false })
    .withMessage('Invalid website URL'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s\-&]+$/)
    .withMessage('Category contains invalid characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  
  body('is_verified')
    .optional()
    .isBoolean()
    .withMessage('is_verified must be a boolean'),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }
    next();
  }
];

/**
 * Validate store filtering and pagination
 */
const validateStoreQuery = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  body('sortBy')
    .optional()
    .isIn(['name', 'created_at', 'updated_at', 'rating', 'rating_count', 'category'])
    .withMessage('Invalid sort field'),
  
  body('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  body('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category filter cannot exceed 50 characters'),
  
  body('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  
  body('maxRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Maximum rating must be between 0 and 5'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active filter must be a boolean'),
  
  body('is_verified')
    .optional()
    .isBoolean()
    .withMessage('is_verified filter must be a boolean'),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorMessages
      });
    }
    next();
  }
];

module.exports = {
  validateStoreCreation,
  validateStoreUpdate,
  validateStoreQuery
};
