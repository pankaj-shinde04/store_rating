const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkUserOperation,
  getUserStatistics,
  getUsersRequiringAttention
} = require('../modules/admin/userManagement');

const {
  getStoreById,
  getStoreAnalytics,
  bulkStoreOperation,
  getStoresRequiringAttention,
  getAllStores,
  approveStore,
  rejectStore,
  getStoreStatistics,
  updateStore,
  deleteStore
} = require('../modules/admin/storeManagement');

const {
  getAllRatings,
  approveRating,
  rejectRating,
  deleteRating,
  getRatingStatistics,
  getRatingsRequiringAttention,
  bulkRatingOperation
} = require('../modules/admin/ratingManagement');

/**
 * Get admin dashboard statistics
 */
const getAdminStats = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get total users count
    const [userCount] = await connection.execute(
      'SELECT COUNT(*) as totalUsers FROM users'
    );
    
    // Get total stores count
    const [storeCount] = await connection.execute(
      'SELECT COUNT(*) as totalStores FROM stores'
    );
    
    // Get total ratings count
    const [ratingCount] = await connection.execute(
      'SELECT COUNT(*) as totalRatings FROM ratings'
    );
    
    // Get average rating
    const [avgRating] = await connection.execute(
      'SELECT AVG(rating_value) as averageRating FROM ratings'
    );
    
    // Get active users (last 30 days)
    const [activeUsers] = await connection.execute(
      'SELECT COUNT(*) as activeUsers FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    
    // Get pending stores (if any)
    const [pendingStores] = await connection.execute(
      'SELECT COUNT(*) as pendingStores FROM stores WHERE is_active = false'
    );
    
    connection.release();
    
    const stats = {
      totalUsers: userCount[0]?.totalUsers || 0,
      totalStores: storeCount[0]?.totalStores || 0,
      totalRatings: ratingCount[0]?.totalRatings || 0,
      averageRating: avgRating[0]?.averageRating || 0,
      activeUsers: activeUsers[0]?.activeUsers || 0,
      pendingStores: pendingStores[0]?.pendingStores || 0
    };
    
    console.log('Admin stats calculated:', stats); // Debug log
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics'
    });
  }
});

/**
 * Get recent users (legacy endpoint for backward compatibility)
 */
const getRecentUsers = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const limit = parseInt(req.query.limit) || 5;
    
    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent users'
    });
  }
});

/**
 * Get recent stores (legacy endpoint for backward compatibility)
 */
const getRecentStores = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const limit = parseInt(req.query.limit) || 5;
    
    const [stores] = await connection.execute(
      'SELECT s.*, u.name as owner_name FROM stores s JOIN users u ON s.owner_id = u.id ORDER BY s.created_at DESC LIMIT ?',
      [limit]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Error fetching recent stores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent stores'
    });
  }
});

module.exports = {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkUserOperation,
  getUserStatistics,
  getStoreById,
  getStoreAnalytics,
  bulkStoreOperation,
  getStoresRequiringAttention,
  getAllStores,
  approveStore,
  rejectStore,
  getStoreStatistics,
  updateStore,
  getAllRatings,
  approveRating,
  rejectRating,
  deleteRating,
  getRatingStatistics,
  getRatingsRequiringAttention,
  bulkRatingOperation,
  getRecentUsers,
  getRecentStores
};
