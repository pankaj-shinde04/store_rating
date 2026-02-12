/**
 * User Profile Module
 * Handles user profile management operations
 */

const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Update user profile
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, phone } = req.body;
    
    const connection = await pool.getConnection();
    
    // Update user profile
    await connection.execute(
      'UPDATE users SET name = ?, address = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, address, phone, userId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: userId,
        name,
        address,
        phone,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new AppError('Failed to update profile', 500);
  }
});

module.exports = {
  updateUserProfile
};
