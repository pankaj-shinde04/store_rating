const bcrypt = require('bcryptjs');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { 
  validateRegistration, 
  validateLogin, 
  validateChangePassword, 
  validateRefreshToken 
} = require('../validators/authValidator');

/**
 * User registration
 */
const register = asyncHandler(async (req, res) => {
  console.log('Registration request body:', req.body);
  const validationErrors = validateRegistration(req.body);
  if (validationErrors.length > 0) {
    console.log('Validation errors:', validationErrors);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: validationErrors.map(err => err.message).join(', '),
      details: validationErrors
    });
  }

  const { name, email, password, role, address, testMode = false } = req.body;

  // If test mode is enabled, only validate without saving
  if (testMode) {
    console.log('🧪 Test mode enabled - validating without saving to database');
    
    // Simulate validation checks without database operations
    const mockUserId = Math.floor(Math.random() * 10000) + 1000;
    
    return res.status(200).json({
      success: true,
      message: 'Registration validation successful (test mode - not saved to database)',
      data: {
        user: {
          id: mockUserId,
          name,
          email,
          role,
          address: address || null,
          createdAt: new Date().toISOString(),
          testMode: true
        },
        tokens: {
          accessToken: 'test_token_' + Date.now(),
          refreshToken: 'test_refresh_' + Date.now()
        },
        testMode: true
      }
    });
  }

  const connection = await pool.getConnection();
  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new AppError('Email already exists', 409, 'Duplicate Entry');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, address || null]
    );

    // Get created user
    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        },
        tokens
      }
    });
  } finally {
    connection.release();
  }
});

/**
 * User login
 */
const login = asyncHandler(async (req, res) => {
  const validationErrors = validateLogin(req.body);
  if (validationErrors.length > 0) {
    throw new AppError('Validation failed', 400, 'ValidationError');
  }

  const { email, password, role } = req.body;

  const connection = await pool.getConnection();
  try {
    // Find user by email
    const [users] = await connection.execute(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if requested role matches user role
    if (user.role !== role) {
      throw new AppError('Role mismatch', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } finally {
    connection.release();
  }
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const validationErrors = validateRefreshToken(req.body);
  if (validationErrors.length > 0) {
    throw new AppError('Validation failed', 400, 'ValidationError');
  }

  const { refreshToken } = req.body;

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  const connection = await pool.getConnection();
  try {
    // Get user from database
    const [users] = await connection.execute(
      'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 401);
    }

    const user = users[0];

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens
      }
    });
  } finally {
    connection.release();
  }
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
  }

  const connection = await pool.getConnection();
  try {
    // Check if email is already used by another user
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      throw new AppError('Email already exists', 409, 'Duplicate Entry');
    }

    // Update user profile
    const [result] = await connection.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    if (result.affectedRows === 0) {
      throw new AppError('User not found', 404);
    }

    // Get updated user data
    const [updatedUsers] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUsers[0]
    });
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const validationErrors = validateChangePassword(req.body);
  // console.log('🔍 Password change validation errors:', validationErrors);
  
  if (validationErrors.length > 0) {
    // console.log('❌ Validation failed with errors:', validationErrors);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors: validationErrors
    });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const connection = await pool.getConnection();
  try {
    // Get user with password
    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = users[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } finally {
    connection.release();
  }
});

/**
 * Logout (client-side token removal)
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  updateProfile,
  changePassword,
  logout
};
