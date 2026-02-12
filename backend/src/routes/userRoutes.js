const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getUserStats,
  getUserRatings,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites
} = require('../controllers/userController');

const router = express.Router();

/**
 * @route   GET /api/users/stats
 * @desc    Get user dashboard statistics
 * @access   Private (Normal User only)
 */
router.get('/stats', authenticate, authorize('normal_user'), getUserStats);

/**
 * @route   GET /api/users/ratings
 * @desc    Get user's recent ratings
 * @access   Private (Normal User only)
 */
router.get('/ratings', authenticate, authorize('normal_user'), getUserRatings);

/**
 * @route   GET /api/users/favorites
 * @desc    Get user's favorite stores
 * @access   Private (Normal User only)
 */
router.get('/favorites', authenticate, authorize('normal_user'), getUserFavorites);

/**
 * @route   POST /api/users/favorites
 * @desc    Add store to favorites
 * @access   Private (Normal User only)
 */
router.post('/favorites', authenticate, authorize('normal_user'), addToFavorites);

/**
 * @route   DELETE /api/users/favorites
 * @desc    Remove store from favorites
 * @access   Private (Normal User only)
 */
router.delete('/favorites', authenticate, authorize('normal_user'), removeFromFavorites);

module.exports = router;
