const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Create a new rating for a store
 */
const createRating = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { store_id, rating_value, review_text } = req.body;
    
    // Validate rating value
    if (rating_value < 1 || rating_value > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating value',
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const connection = await pool.getConnection();
    
    // Check if user is trying to rate their own store
    const [storeCheck] = await connection.execute(
      'SELECT owner_id FROM stores WHERE id = ?',
      [store_id]
    );
    
    if (storeCheck.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: 'The specified store does not exist'
      });
    }
    
    if (storeCheck[0].owner_id === userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        error: 'Cannot rate own store',
        message: 'Store owners cannot rate their own stores'
      });
    }
    
    // Check if user has already rated this store
    const [existingRating] = await connection.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, store_id]
    );
    
    if (existingRating.length > 0) {
      // Update existing rating
      await connection.execute(
        'UPDATE ratings SET rating_value = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
        [rating_value, review_text, userId, store_id]
      );
      
      connection.release();
      
      res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        data: {
          user_id: userId,
          store_id,
          rating_value,
          review_text,
          updated_at: new Date().toISOString()
        }
      });
    } else {
      // Create new rating
      await connection.execute(
        'INSERT INTO ratings (user_id, store_id, rating_value, review_text) VALUES (?, ?, ?, ?)',
        [userId, store_id, rating_value, review_text]
      );
      
      connection.release();
      
      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: {
          user_id: userId,
          store_id,
          rating_value,
          review_text,
          created_at: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error creating rating:', error);
    throw new AppError('Failed to submit rating', 500);
  }
});

/**
 * Get all ratings for a specific store (for store owners)
 */
const getStoreRatings = asyncHandler(async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    
    // Verify that the user owns this store
    const [storeCheck] = await connection.execute(
      'SELECT owner_id FROM stores WHERE id = ?',
      [storeId]
    );
    
    if (storeCheck.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: 'The specified store does not exist'
      });
    }
    
    if (storeCheck[0].owner_id !== userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view ratings for your own stores'
      });
    }
    
    // Get all ratings for this store (excluding store owner's own ratings)
    const [ratings] = await connection.execute(
      `SELECT r.id, r.rating_value, r.review_text, r.created_at, r.updated_at,
              u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Store ratings retrieved successfully',
      data: ratings
    });
  } catch (error) {
    console.error('Error getting store ratings:', error);
    throw new AppError('Failed to retrieve store ratings', 500);
  }
});

/**
 * Get user's own ratings
 */
const getUserRatings = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    
    const [ratings] = await connection.execute(
      `SELECT r.id, r.rating_value, r.review_text, r.created_at, r.updated_at,
              s.name as store_name, s.address as store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'User ratings retrieved successfully',
      data: ratings
    });
  } catch (error) {
    console.error('Error getting user ratings:', error);
    throw new AppError('Failed to retrieve user ratings', 500);
  }
});

/**
 * Delete a rating
 */
const deleteRating = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const ratingId = req.params.ratingId;
    
    const connection = await pool.getConnection();
    
    // Verify that the rating belongs to the user
    const [ratingCheck] = await connection.execute(
      'SELECT user_id FROM ratings WHERE id = ?',
      [ratingId]
    );
    
    if (ratingCheck.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
        message: 'The specified rating does not exist'
      });
    }
    
    if (ratingCheck[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete your own ratings'
      });
    }
    
    await connection.execute(
      'DELETE FROM ratings WHERE id = ?',
      [ratingId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new AppError('Failed to delete rating', 500);
  }
});

module.exports = {
  createRating,
  getStoreRatings,
  getUserRatings,
  deleteRating
};
