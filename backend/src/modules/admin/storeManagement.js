/**
 * Admin Module - Store Management
 * Handles all store-related administrative operations
 */

const { pool } = require('../../config/database');
const { asyncHandler, AppError } = require('../../middlewares/errorHandler');

/**
 * Get store by ID with full details including owner info
 */
const getStoreById = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    
    const [stores] = await connection.execute(
      `SELECT s.*, 
              u.name as owner_name, 
              u.email as owner_email,
              (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as total_ratings,
              (SELECT AVG(rating_value) FROM ratings WHERE store_id = s.id) as avg_rating,
              (SELECT COUNT(DISTINCT user_id) FROM ratings WHERE store_id = s.id) as unique_customers
       FROM stores s 
       JOIN users u ON s.owner_id = u.id 
       WHERE s.id = ?`,
      [id]
    );
    
    connection.release();
    
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    const store = stores[0];
    store.total_ratings = store.total_ratings || 0;
    store.avg_rating = parseFloat(store.avg_rating) || 0;
    store.unique_customers = store.unique_customers || 0;
    
    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store'
    });
  }
});

/**
 * Get store analytics and performance data
 */
const getStoreAnalytics = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    
    const [analytics] = await connection.execute(
      `SELECT 
              (SELECT COUNT(*) FROM ratings WHERE store_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as ratings_last_30_days,
              (SELECT AVG(rating_value) FROM ratings WHERE store_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as avg_rating_last_30_days,
              (SELECT COUNT(DISTINCT user_id) FROM ratings WHERE store_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as unique_customers_last_30_days,
              (SELECT COUNT(*) FROM ratings WHERE store_id = ? AND rating_value <= 2) as low_ratings_count,
              (SELECT COUNT(*) FROM ratings WHERE store_id = ? AND rating_value >= 4) as high_ratings_count
       FROM stores s 
       WHERE s.id = ?`,
      [id, id, id, id, id]
    );
    
    connection.release();
    
    if (analytics.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    const storeAnalytics = analytics[0];
    storeAnalytics.avg_rating_last_30_days = parseFloat(storeAnalytics.avg_rating_last_30_days) || 0;
    
    res.status(200).json({
      success: true,
      data: storeAnalytics
    });
  } catch (error) {
    console.error('Error fetching store analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store analytics'
    });
  }
});

/**
 * Bulk store operations (approve/reject multiple stores)
 */
const bulkStoreOperation = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { storeIds, operation, reason } = req.body;
    
    if (!storeIds || !Array.isArray(storeIds)) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid store IDs provided'
      });
    }
    
    const placeholders = storeIds.map(() => '?').join(',');
    const values = [...storeIds, operation === 'approve' ? 1 : 0, reason || ''];
    
    const [result] = await connection.execute(
      `UPDATE stores SET is_active = ?, status_reason = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      values
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: `${operation === 'approve' ? 'Approved' : 'Rejected'} ${result.affectedRows} stores successfully`,
      data: {
        affectedStores: result.affectedRows,
        operation,
        reason
      }
    });
  } catch (error) {
    console.error('Error in bulk store operation:', error);
    res.status(500).json({
      success: false,
      error: `Failed to ${req.body.operation} stores`
    });
  }
});

/**
 * Get stores requiring attention (new registrations, low ratings, etc.)
 */
const getStoresRequiringAttention = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stores] = await connection.execute(
      `SELECT s.*, 
              u.name as owner_name, 
              u.email as owner_email,
              (SELECT AVG(rating_value) FROM ratings WHERE store_id = s.id) as avg_rating,
              (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as total_ratings
       FROM stores s 
       JOIN users u ON s.owner_id = u.id 
       WHERE s.is_active = 0 
          OR (SELECT AVG(rating_value) FROM ratings WHERE store_id = s.id) < 3.0
          OR s.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY s.created_at DESC
       LIMIT 50`
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Error fetching stores requiring attention:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stores requiring attention'
    });
  }
});

/**
 * Get all stores with pagination and filtering
 */
const getAllStores = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const dateFrom = req.query.dateFrom || '';
    const dateTo = req.query.dateTo || '';
    
    let query = `
      SELECT s.*, 
              u.name as owner_name, 
              u.email as owner_email,
              COUNT(r.id) as total_ratings,
              AVG(r.rating_value) as avg_rating,
              COUNT(DISTINCT r.user_id) as unique_customers
       FROM stores s 
       JOIN users u ON s.owner_id = u.id 
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE 1=1
    `;
    let params = [];
    
    // Add status filter
    if (status !== '') {
      const statusValue = status === 'active' ? 1 : 0;
      query += ` AND s.is_active = ?`;
      params.push(statusValue);
    }
    
    // Add search filter
    if (search) {
      query += ` AND (s.name LIKE ? OR s.address LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add date range filter
    if (dateFrom) {
      query += ` AND s.created_at >= ?`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND s.created_at <= ?`;
      params.push(dateTo);
    }
    
    // Group by for aggregate functions
    query += ` GROUP BY s.id, s.name, s.address, s.phone, s.email, s.website, s.category, s.description, s.owner_id, s.is_active, s.created_at, s.updated_at, u.name, u.email`;
    
    // Add sorting
    const validSortFields = ['created_at', 'name', 'avg_rating'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY s.${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }
    
    // Validate and sanitize limit and offset
    const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const validOffset = Math.max(0, parseInt(offset) || 0);
    
    query += ` LIMIT ${validLimit} OFFSET ${validOffset}`;
    
    const [stores] = await connection.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM stores s 
      JOIN users u ON s.owner_id = u.id 
      WHERE 1=1
    `;
    let countParams = [];
    
    if (status !== '') {
      const statusValue = status === 'active' ? 1 : 0;
      countQuery += ` AND s.is_active = ?`;
      countParams.push(statusValue);
    }
    
    if (search) {
      countQuery += ` AND (s.name LIKE ? OR s.address LIKE ? OR u.name LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (dateFrom) {
      countQuery += ` AND s.created_at >= ?`;
      countParams.push(dateFrom);
    }
    
    if (dateTo) {
      countQuery += ` AND s.created_at <= ?`;
      countParams.push(dateTo);
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: {
        stores,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0]?.total || 0,
          pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
        },
        filters: {
          status,
          search,
          dateRange: { from: dateFrom, to: dateTo },
          sort: { by: sortBy, order: sortOrder }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stores'
    });
  }
});

/**
 * Update store information
 */
const updateStore = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { name, address, phone, email, website, category, description, is_active } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Name and address are required'
      });
    }
    
    // Check if store exists
    const [existingStore] = await connection.execute(
      'SELECT id FROM stores WHERE id = ?',
      [id]
    );
    
    if (existingStore.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    const [result] = await connection.execute(
      'UPDATE stores SET name = ?, address = ?, phone = ?, email = ?, website = ?, category = ?, description = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [name, address, phone, email, website, category, description, is_active, id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Store updated successfully'
    });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update store'
    });
  }
});

/**
 * Approve store
 */
const approveStore = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    
    const [result] = await connection.execute(
      'UPDATE stores SET is_active = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Store approved successfully'
    });
  } catch (error) {
    console.error('Error approving store:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve store'
    });
  }
});

/**
 * Reject store
 */
const rejectStore = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { reason } = req.body;
    
    const [result] = await connection.execute(
      'UPDATE stores SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Store rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting store:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject store'
    });
  }
});

/**
 * Get store statistics for admin dashboard
 */
const getStoreStatistics = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_stores,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_stores,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_stores,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_stores_last_30_days,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_stores_last_7_days
      FROM stores
    `);
    
    connection.release();
    
    const storeStats = stats[0];
    
    res.status(200).json({
      success: true,
      data: storeStats
    });
  } catch (error) {
    console.error('Error fetching store statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store statistics'
    });
  }
});

module.exports = {
  getStoreById,
  getStoreAnalytics,
  bulkStoreOperation,
  getStoresRequiringAttention,
  getAllStores,
  approveStore,
  rejectStore,
  getStoreStatistics,
  updateStore
};
