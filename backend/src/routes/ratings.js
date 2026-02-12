const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateRating } = require('../validators/ratingValidator');
const {
  createRating,
  getStoreRatings,
  getUserRatings,
  deleteRating
} = require('../controllers/ratingsController');

const router = express.Router();

/**
 * @route   GET /api/ratings
 * @desc    Test endpoint for ratings API
 * @access   Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ratings API is working',
    available_endpoints: [
      'POST /api/ratings - Create rating (Normal users only)',
      'GET /api/ratings/store/:storeId - Get store ratings (Store owners only)',
      'GET /api/ratings/user - Get user ratings (Normal users only)',
      'DELETE /api/ratings/:ratingId - Delete rating (Normal users only)'
    ]
  });
});

/**
 * @route   POST /api/ratings
 * @desc    Create a new rating for a store
 * @access   Private (Normal users only)
 */
router.post('/', 
  authenticate, 
  authorize('normal_user'), 
  validateRating, 
  createRating
);

/**
 * @route   GET /api/ratings/store/:storeId
 * @desc    Get all ratings for a specific store (store owner only)
 * @access   Private (Store Owner only)
 */
router.get('/store/:storeId', 
  authenticate, 
  authorize('store_owner'), 
  getStoreRatings
);

/**
 * @route   GET /api/ratings/user
 * @desc    Get current user's ratings
 * @access   Private (Normal users only)
 */
router.get('/user', 
  authenticate, 
  authorize('normal_user'), 
  getUserRatings
);

/**
 * @route   DELETE /api/ratings/:ratingId
 * @desc    Delete a rating
 * @access   Private (Normal users only)
 */
router.delete('/:ratingId', 
  authenticate, 
  authorize('normal_user'), 
  deleteRating
);

module.exports = router;
