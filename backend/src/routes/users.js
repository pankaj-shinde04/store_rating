const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { getUserStats, getUserRatings } = require('../controllers/userController');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile endpoint - Coming Soon',
    data: {
      user: req.user
    }
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update user profile endpoint - Coming Soon'
  });
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics including average rating
 * @access  Private (Normal users only)
 */
router.get('/stats', 
  authenticate, 
  authorize('normal_user'), 
  getUserStats
);

/**
 * @route   GET /api/users/ratings
 * @desc    Get user's ratings with store information
 * @access  Private (Normal users only)
 */
router.get('/ratings', 
  authenticate, 
  authorize('normal_user'), 
  getUserRatings
);

module.exports = router;
