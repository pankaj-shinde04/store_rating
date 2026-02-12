/**
 * User Authentication Module
 * Handles user authentication operations
 */

const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Change user password
 */
const changeUserPassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New passwords do not match',
        message: 'New passwords do not match'
      });
    }
    
    const connection = await pool.getConnection();
    
    // Get user with current password
    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Verify current password
    const bcrypt = require('bcrypt');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        id: userId,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error changing user password:', error);
    throw new AppError('Failed to change password', 500);
  }
});

module.exports = {
  changeUserPassword
};
