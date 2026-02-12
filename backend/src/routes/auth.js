const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/auth');
const {
  register,
  login,
  refreshToken,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private (all authenticated users)
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private (all authenticated users)
 */
router.put('/change-password', authenticate, changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (all authenticated users)
 */
router.post('/logout', authenticate, logout);

module.exports = router;
