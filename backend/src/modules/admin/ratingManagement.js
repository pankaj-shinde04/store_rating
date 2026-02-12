/**
 * Admin Module - Rating Management
 * Handles all rating-related administrative operations
 */

const { pool } = require('../../config/database');
const { asyncHandler, AppError } = require('../../middlewares/errorHandler');

/**
 * Get all ratings with advanced filtering and pagination
 */
const getAllRatings = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const {
      page = 1,
      limit = 10,
      search = '',
      rating = '',
      store = '',
      user = '',
      dateFrom = '',
      dateTo = '',
      status = 'all' // all, approved, pending, rejected
    } = req.query;

    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        r.id,
        r.rating_value,
        r.created_at,
        r.status,
        r.rejection_reason,
        u.name as user_name,
        u.email as user_email,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE 1=1
    `;
    
    let params = [];
    
    // Add status filter
    if (status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    
    // Add rating filter
    if (rating !== '') {
      query += ` AND r.rating_value = ?`;
      params.push(rating);
    }
    
    // Add store filter
    if (store !== '') {
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      params.push(`%${store}%`, `%${store}%`);
    }
    
    // Add user filter
    if (user !== '') {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${user}%`, `%${user}%`);
    }
    
    // Add date range filter
    if (dateFrom) {
      query += ` AND r.created_at >= ?`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND r.created_at <= ?`;
      params.push(dateTo);
    }
    
    // Add search filter
    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR s.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add sorting
    query += ` ORDER BY r.created_at DESC`;
    
    // Add pagination
    const limitParam = parseInt(limit);
    const offsetParam = parseInt(offset);
    
    query += ` LIMIT ${limitParam} OFFSET ${offsetParam}`;
    
    const [ratings] = await connection.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE 1=1
    `;
    let countParams = [];
    
    // Add same filters to count query
    if (status !== 'all') {
      countQuery += ` AND r.status = ?`;
      countParams.push(status);
    }
    
    if (rating !== '') {
      countQuery += ` AND r.rating_value = ?`;
      countParams.push(rating);
    }
    
    if (store !== '') {
      countQuery += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      countParams.push(`%${store}%`, `%${store}%`);
    }
    
    if (user !== '') {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      countParams.push(`%${user}%`, `%${user}%`);
    }
    
    if (dateFrom) {
      countQuery += ` AND r.created_at >= ?`;
      countParams.push(dateFrom);
    }
    
    if (dateTo) {
      countQuery += ` AND r.created_at <= ?`;
      countParams.push(dateTo);
    }
    
    if (search) {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR s.name LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: {
        ratings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    if (connection) {
      connection.release();
    }
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ratings'
    });
  }
};

/**
 * Approve rating
 */
const approveRating = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    
    const [result] = await connection.execute(
      'UPDATE ratings SET status = "approved", updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Rating approved successfully'
    });
  } catch (error) {
    connection.release();
    console.error('Error approving rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve rating'
    });
  }
};

/**
 * Reject rating
 */
const rejectRating = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { reason } = req.body;
    
    const [result] = await connection.execute(
      'UPDATE ratings SET status = "rejected", rejection_reason = ?, updated_at = NOW() WHERE id = ?',
      [reason || 'Rejected by admin', id]
    );
    
    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Rating rejected successfully'
    });
  } catch (error) {
    connection.release();
    console.error('Error rejecting rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject rating'
    });
  }
};

/**
 * Delete rating
 */
const deleteRating = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    
    const [result] = await connection.execute(
      'DELETE FROM ratings WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    connection.release();
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rating'
    });
  }
};

/**
 * Get rating statistics
 */
const getRatingStatistics = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Overall statistics
    const [overallStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating_value) as average_rating,
        MIN(rating_value) as min_rating,
        MAX(rating_value) as max_rating
      FROM ratings
    `);
    
    // Rating distribution
    const [ratingDistribution] = await connection.execute(`
      SELECT 
        rating_value,
        COUNT(*) as count
      FROM ratings
      GROUP BY rating_value
      ORDER BY rating_value DESC
    `);
    
    // Status distribution
    const [statusDistribution] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM ratings
      GROUP BY status
    `);
    
    // Recent ratings (last 7 days)
    const [recentRatings] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        AVG(rating_value) as avg_rating
      FROM ratings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Top rated stores
    const [topStores] = await connection.execute(`
      SELECT 
        s.id,
        s.name,
        COUNT(r.id) as rating_count,
        AVG(r.rating_value) as avg_rating
      FROM stores s
      JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
    `);
    
    // Low rated stores
    const [lowRatedStores] = await connection.execute(`
      SELECT 
        s.id,
        s.name,
        COUNT(r.id) as rating_count,
        AVG(r.rating_value) as avg_rating
      FROM stores s
      JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
      HAVING rating_count >= 1
      ORDER BY avg_rating ASC
      LIMIT 10
    `);
    
    // Pending ratings
    const [pendingCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM ratings
      WHERE status = 'pending'
    `);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0],
        distribution: ratingDistribution,
        statusDistribution: statusDistribution,
        recent: recentRatings,
        topStores,
        lowRatedStores,
        pendingCount: pendingCount[0].count
      }
    });
  } catch (error) {
    connection.release();
    console.error('Error fetching rating statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rating statistics'
    });
  }
};

/**
 * Get ratings requiring attention
 */
const getRatingsRequiringAttention = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Low ratings (1-2 stars)
    const [lowRatings] = await connection.execute(`
      SELECT 
        r.id,
        r.rating_value,
        r.created_at,
        r.status,
        r.rejection_reason,
        u.name as user_name,
        u.email as user_email,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.rating_value <= 2
      ORDER BY r.created_at DESC
      LIMIT 20
    `);
    
    // Pending ratings
    const [pendingRatings] = await connection.execute(`
      SELECT 
        r.id,
        r.rating_value,
        r.created_at,
        r.status,
        r.rejection_reason,
        u.name as user_name,
        u.email as user_email,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 20
    `);
    
    // Recent ratings (last 24 hours)
    const [recentRatings] = await connection.execute(`
      SELECT 
        r.id,
        r.rating_value,
        r.created_at,
        r.status,
        r.rejection_reason,
        u.name as user_email,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY r.created_at DESC
      LIMIT 20
    `);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: {
        lowRatings,
        pendingRatings,
        recentRatings
      }
    });
  } catch (error) {
    connection.release();
    console.error('Error fetching ratings requiring attention:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ratings requiring attention'
    });
  }
};

/**
 * Bulk operations on ratings
 */
const bulkRatingOperation = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { operation, ratingIds, reason } = req.body;
    
    if (!operation || !ratingIds || !Array.isArray(ratingIds)) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters'
      });
    }
    
    let query = '';
    let params = [];
    
    switch (operation) {
      case 'approve':
        query = 'UPDATE ratings SET status = "approved", updated_at = NOW() WHERE id IN (?)';
        params = [ratingIds];
        break;
      case 'reject':
        query = 'UPDATE ratings SET status = "rejected", rejection_reason = ?, updated_at = NOW() WHERE id IN (?)';
        params = [reason || 'Bulk rejected by admin', ratingIds];
        break;
      case 'delete':
        query = 'DELETE FROM ratings WHERE id IN (?)';
        params = [ratingIds];
        break;
      default:
        connection.release();
        return res.status(400).json({
          success: false,
          error: 'Invalid operation'
        });
    }
    
    const [result] = await connection.execute(query, params);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: `Successfully ${operation}ed ${result.affectedRows} ratings`,
      affectedCount: result.affectedRows
    });
  } catch (error) {
    connection.release();
    console.error('Error performing bulk rating operation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk operation'
    });
  }
};

module.exports = {
  getAllRatings,
  approveRating,
  rejectRating,
  deleteRating,
  getRatingStatistics,
  getRatingsRequiringAttention,
  bulkRatingOperation
};
