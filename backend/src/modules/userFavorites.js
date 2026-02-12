/**
 * User Favorites Module
 * Handles user favorite store operations
 */

const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Add store to user favorites
 */
const addToFavorites = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.body;
    
    const connection = await pool.getConnection();
    
    // Check if store exists
    const [stores] = await connection.execute(
      'SELECT id, name FROM stores WHERE id = ?',
      [storeId]
    );
    
    if (stores.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: 'Store not found'
      });
    }
    
    // Check if already in favorites
    const [existing] = await connection.execute(
      'SELECT id FROM user_favorites WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Store already in favorites',
        message: 'Store already in favorites'
      });
    }
    
    // Add to favorites
    await connection.execute(
      'INSERT INTO user_favorites (user_id, store_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [userId, storeId]
    );
    
    connection.release();
    
    res.status(201).json({
      success: true,
      message: 'Store added to favorites',
      data: {
        user_id: userId,
        store_id: storeId,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw new AppError('Failed to add to favorites', 500);
  }
});

/**
 * Remove store from user favorites
 */
const removeFromFavorites = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.body;
    
    const connection = await pool.getConnection();
    
    // Remove from favorites
    const [result] = await connection.execute(
      'DELETE FROM user_favorites WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Store removed from favorites',
      data: {
        user_id: userId,
        store_id: storeId,
        deleted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw new AppError('Failed to remove from favorites', 500);
  }
});

/**
 * Get user's favorite stores
 */
const getUserFavorites = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const connection = await pool.getConnection();
    
    const [favorites] = await connection.execute(
      `SELECT uf.id, uf.created_at,
              s.id as store_id, s.name as store_name, s.address as store_address,
              AVG(r.rating_value) as average_rating
       FROM user_favorites uf
       JOIN stores s ON uf.store_id = s.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE uf.user_id = ?
       GROUP BY s.id, uf.id, uf.created_at
       ORDER BY uf.created_at DESC
       LIMIT ${limit}`,
      [userId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'User favorites retrieved successfully',
      data: favorites
    });
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw new AppError('Failed to retrieve user favorites', 500);
  }
});

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
};
