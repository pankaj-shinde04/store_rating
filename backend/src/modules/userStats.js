/**
 * User Statistics Module
 * Handles user statistics and rating data operations
 */

const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Get user statistics with enhanced data including store averages
 */
const getUserStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    // Get total ratings by this user
    const [ratingCount] = await connection.execute(
      'SELECT COUNT(*) as totalRatings FROM ratings WHERE user_id = ?',
      [userId]
    );
    
    // Get average rating given by this user
    const [avgRating] = await connection.execute(
      'SELECT AVG(rating_value) as averageRating FROM ratings WHERE user_id = ?',
      [userId]
    );
    
    // Get count of unique stores rated by this user
    const [ratedStores] = await connection.execute(
      'SELECT COUNT(DISTINCT store_id) as ratedStores FROM ratings WHERE user_id = ?',
      [userId]
    );
    
    // Get count of favorite stores (4+ star ratings)
    const [favoriteStores] = await connection.execute(
      'SELECT COUNT(*) as favoriteStores FROM ratings WHERE user_id = ? AND rating_value >= 4',
      [userId]
    );
    
    // Get user's recent ratings with store information and store's average rating
    const [recentRatings] = await connection.execute(
      `SELECT r.id, r.rating_value, r.review_text, r.created_at,
              s.name as store_name, s.address as store_address, s.category,
              AVG(r2.rating_value) as store_average_rating,
              COUNT(r2.id) as store_rating_count
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       LEFT JOIN ratings r2 ON s.id = r2.store_id
       WHERE r.user_id = ?
       GROUP BY r.id, s.id
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [userId]
    );
    
    connection.release();
    
    const stats = {
      totalRatings: ratingCount[0]?.totalRatings || 0,
      averageRating: avgRating[0]?.averageRating ? parseFloat(avgRating[0].averageRating.toFixed(1)) : 0,
      ratedStores: ratedStores[0]?.ratedStores || 0,
      favoriteStores: favoriteStores[0]?.favoriteStores || 0,
      recentRatings: recentRatings.map(rating => ({
        id: rating.id,
        rating_value: rating.rating_value,
        review_text: rating.review_text,
        created_at: rating.created_at,
        store_name: rating.store_name,
        store_address: rating.store_address,
        store_category: rating.category,
        store_average_rating: rating.store_average_rating ? parseFloat(rating.store_average_rating.toFixed(1)) : 0,
        store_rating_count: rating.store_rating_count || 0
      }))
    };
    
    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new AppError('Failed to retrieve user statistics', 500);
  }
});

/**
 * Get user's recent ratings with store information and store averages
 */
const getUserRatings = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();
    
    // Get total count for pagination
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM ratings WHERE user_id = ?',
      [userId]
    );
    
    // Get user's ratings with store information and store's average rating
    const [ratings] = await connection.execute(
      `SELECT r.id, r.rating_value, r.review_text, r.created_at, r.updated_at,
              s.name as store_name, s.address as store_address, s.category, s.is_verified,
              AVG(r2.rating_value) as store_average_rating,
              COUNT(r2.id) as store_rating_count
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       LEFT JOIN ratings r2 ON s.id = r2.store_id
       WHERE r.user_id = ?
       GROUP BY r.id, s.id
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    connection.release();
    
    const totalRatings = countResult[0].total;
    const totalPages = Math.ceil(totalRatings / limit);
    
    res.status(200).json({
      success: true,
      message: 'User ratings retrieved successfully',
      data: {
        ratings: ratings.map(rating => ({
          id: rating.id,
          rating_value: rating.rating_value,
          review_text: rating.review_text,
          created_at: rating.created_at,
          updated_at: rating.updated_at,
          store_name: rating.store_name,
          store_address: rating.store_address,
          store_category: rating.category,
          store_is_verified: rating.is_verified,
          store_average_rating: rating.store_average_rating ? parseFloat(rating.store_average_rating.toFixed(1)) : 0,
          store_rating_count: rating.store_rating_count || 0
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalRatings,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting user ratings:', error);
    throw new AppError('Failed to retrieve user ratings', 500);
  }
});

module.exports = {
  getUserStats,
  getUserRatings
};
