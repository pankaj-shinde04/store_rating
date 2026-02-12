/**
 * Rating validation middleware
 */

/**
 * Validate rating data
 */
const validateRating = (req, res, next) => {
  const errors = [];
  const { store_id, rating_value, review_text } = req.body;

  // Store ID validation
  if (!store_id) {
    errors.push({ field: 'store_id', message: 'Store ID is required' });
  } else if (typeof store_id !== 'number' || store_id <= 0) {
    errors.push({ field: 'store_id', message: 'Store ID must be a positive number' });
  }

  // Rating value validation
  if (!rating_value) {
    errors.push({ field: 'rating_value', message: 'Rating value is required' });
  } else if (typeof rating_value !== 'number') {
    errors.push({ field: 'rating_value', message: 'Rating value must be a number' });
  } else if (rating_value < 1 || rating_value > 5) {
    errors.push({ field: 'rating_value', message: 'Rating value must be between 1 and 5' });
  }

  // Review text validation (optional)
  if (review_text && typeof review_text !== 'string') {
    errors.push({ field: 'review_text', message: 'Review text must be a string' });
  } else if (review_text && review_text.length > 1000) {
    errors.push({ field: 'review_text', message: 'Review text cannot exceed 1000 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Invalid rating data',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateRating
};
