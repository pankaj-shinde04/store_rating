/**
 * Admin Module - Enhanced User Management
 * Complete CRUD operations for user administration
 */

const { pool } = require('../../config/database');
const { asyncHandler, AppError } = require('../../middlewares/errorHandler');

/**
 * Get all users with advanced filtering and pagination
 */
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const dateFrom = req.query.dateFrom || '';
    const dateTo = req.query.dateTo || '';
    
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.address, u.is_active, u.created_at, u.updated_at,
             COUNT(r.id) as total_ratings,
             AVG(r.rating_value) as avg_rating,
             COUNT(DISTINCT r.store_id) as stores_rated,
             MAX(r.created_at) as last_rating_date
       FROM users u 
       LEFT JOIN ratings r ON u.id = r.user_id
       WHERE 1=1
    `;
    let params = [];
    
    // Add role filter
    if (role !== '') {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    
    // Add status filter
    if (status !== '') {
      const statusValue = status === 'active' ? 1 : 0;
      query += ` AND u.is_active = ?`;
      params.push(statusValue);
    }
    
    // Add search filter
    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add date range filter
    if (dateFrom) {
      query += ` AND u.created_at >= ?`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND u.created_at <= ?`;
      params.push(dateTo);
    }
    
    // Group by for aggregate functions
    query += ` GROUP BY u.id, u.name, u.email, u.role, u.address, u.is_active, u.created_at, u.updated_at`;
    
    // Add sorting
    const validSortFields = ['created_at', 'name', 'email', 'last_login'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY u.${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY u.created_at DESC`;
    }
    
    // Validate and sanitize limit and offset
    const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const validOffset = Math.max(0, parseInt(offset) || 0);
    
    query += ` LIMIT ${validLimit} OFFSET ${validOffset}`;
    
    const [users] = await connection.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM users u 
      WHERE 1=1
    `;
    let countParams = [];
    
    if (role) {
      countQuery += ` AND u.role = ?`;
      countParams.push(role);
    }
    
    if (status !== '') {
      const statusValue = status === 'active' ? 1 : 0;
      countQuery += ` AND u.is_active = ?`;
      countParams.push(statusValue);
    }
    
    if (search) {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (dateFrom) {
      countQuery += ` AND u.created_at >= ?`;
      countParams.push(dateFrom);
    }
    
    if (dateTo) {
      countQuery += ` AND u.created_at <= ?`;
      countParams.push(dateTo);
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0]?.total || 0,
          pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
        },
        filters: {
          role,
          status,
          search,
          dateRange: { from: dateFrom, to: dateTo },
          sort: { by: sortBy, order: sortOrder }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * Create new user with validation
 */
const createUser = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { name, email, password, role, address } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }
    
    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, role || 'normal_user', address]
    );
    
    connection.release();
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        email,
        role: role || 'normal_user',
        address,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

/**
 * Update user with comprehensive validation
 */
const updateUser = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { name, email, role, address, phone, is_active } = req.body;
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        connection.release();
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }
    
    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Email already exists for another user'
      });
    }
    
    const [result] = await connection.execute(
      'UPDATE users SET name = ?, email = ?, role = ?, address = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [name, email, role, address, is_active, id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        name,
        email,
        role,
        address,
        phone,
        is_active,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

/**
 * Delete user with safety checks
 */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;
    
    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent deletion of admin users
    if (existingUser[0].role === 'admin') {
      connection.release();
      return res.status(403).json({
        success: false,
        error: 'Cannot delete admin users'
      });
    }
    
    // Check if user has associated data
    const [ratingsCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM ratings WHERE user_id = ?',
      [id]
    );
    
    const [storesCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM stores WHERE owner_id = ?',
      [id]
    );
    
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: existingUser[0],
        warnings: ratingsCount[0].count > 0 ? 'User had associated ratings' : null,
        storesCount: storesCount[0].count > 0 ? 'User owned stores' : null
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

/**
 * Bulk user operations (activate/deactivate multiple users)
 */
const bulkUserOperation = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { userIds, operation, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid user IDs provided'
      });
    }
    
    const placeholders = userIds.map(() => '?').join(',');
    const values = [...userIds, operation === 'activate' ? 1 : 0, reason || ''];
    
    const [result] = await connection.execute(
      `UPDATE users SET is_active = ?, status_reason = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      values
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: `${operation === 'activate' ? 'Activated' : 'Deactivated'} ${result.affectedRows} users successfully`,
      data: {
        affectedUsers: result.affectedRows,
        operation,
        reason
      }
    });
  } catch (error) {
    console.error('Error in bulk user operation:', error);
    res.status(500).json({
      success: false,
      error: `Failed to ${req.body.operation} users`
    });
  }
});

/**
 * Get user statistics for admin dashboard
 */
const getUserStatistics = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'normal_user' THEN 1 END) as normal_users,
        COUNT(CASE WHEN role = 'store_owner' THEN 1 END) as store_owners,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_last_30_days,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_last_7_days
      FROM users
    `);
    
    connection.release();
    
    const userStats = stats[0];
    
    res.status(200).json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkUserOperation,
  getUserStatistics
};
