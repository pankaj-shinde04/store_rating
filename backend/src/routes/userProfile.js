const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { updateUserProfile } = require('../controllers/userProfileController');

const router = express.Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access   Private (Normal User only)
 */
router.put('/profile', 
  authenticate, 
  authorize('normal_user'), 
  updateUserProfile
);

module.exports = router;
