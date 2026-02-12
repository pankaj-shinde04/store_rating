 const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Get store owner dashboard statistics
 */
const getOwnerStats = asyncHandler(async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('=== OWNER STATS REQUEST ===');
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Object:', req.user);
    console.log('==========================');
    
    // Check if user is actually a store owner
    if (userRole !== 'store_owner') {
      console.log('Access denied: User is not a store owner');
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only store owners can access this endpoint.'
      });
    }
    
    connection = await pool.getConnection();
    
    // Get total stores for this owner
    const [storeCount] = await connection.execute(
      'SELECT COUNT(*) as totalStores FROM stores WHERE owner_id = ?',
      [userId]
    );
    
    console.log('Store count result:', storeCount[0]);
    
    // Get total ratings for all owner's stores
    const [ratingStats] = await connection.execute(
      `SELECT 
        COUNT(r.id) as totalRatings,
        AVG(r.rating_value) as averageRating
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = ?`,
      [userId]
    );
    
    console.log('Rating stats result:', ratingStats[0]);
    
    // Get unique customers who rated owner's stores
    const [customerStats] = await connection.execute(
      `SELECT COUNT(DISTINCT r.user_id) as totalCustomers
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = ?`,
      [userId]
    );
    
    console.log('Customer stats result:', customerStats[0]);
    
    // Get pending reviews (reviews without response, if applicable)
    const [pendingReviews] = await connection.execute(
      `SELECT COUNT(*) as pendingReviews
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = ? 
       AND r.review_text IS NOT NULL 
       AND r.review_text != ''`,
      [userId]
    );
    
    console.log('Pending reviews result:', pendingReviews[0]);
    
    const stats = {
      totalStores: storeCount[0].totalStores || 0,
      totalRatings: ratingStats[0].totalRatings || 0,
      averageRating: ratingStats[0].averageRating ? parseFloat(ratingStats[0].averageRating.toFixed(1)) : 0,
      totalCustomers: customerStats[0].totalCustomers || 0,
      pendingReviews: pendingReviews[0].pendingReviews || 0
    };
    
    console.log('Owner stats calculated:', stats); // Debug log
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * Get customers who rated owner's stores
 */
const getOwnerCustomers = asyncHandler(async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('User accessing owner customers:', { userId, userRole }); // Debug log
    
    // Check if user is actually a store owner
    if (userRole !== 'store_owner') {
      console.log('Access denied: User is not a store owner');
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only store owners can access this endpoint.'
      });
    }
    
    connection = await pool.getConnection();
    
    // Get customers who rated owner's stores with rating statistics
    const [customers] = await connection.execute(
      `SELECT DISTINCT u.id, u.name, u.email, u.address,
              COUNT(r.id) as total_reviews,
              AVG(r.rating_value) as average_rating,
              MAX(r.created_at) as last_rating_date
       FROM users u
       JOIN ratings r ON u.id = r.user_id
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY u.id, u.name, u.email, u.address
       ORDER BY last_rating_date DESC`,
      [userId]
    );
    
    const customersWithRatings = customers.map(customer => ({
      ...customer,
      total_reviews: customer.total_reviews || 0,
      average_rating: customer.average_rating ? parseFloat(customer.average_rating.toFixed(1)) : 0,
      last_rating_date: customer.last_rating_date
    }));
    
    console.log('Owner customers calculated:', customersWithRatings); // Debug log
    console.log('About to send response with data:', customersWithRatings); // Debug log
    
    res.status(200).json({
      success: true,
      data: customersWithRatings
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * Get stores owned by the current user
 */
const getOwnerStores = asyncHandler(async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await pool.getConnection();
    
    // Get stores owned by the current user (simplified)
    const [stores] = await connection.execute(
      'SELECT id, name, address FROM stores WHERE owner_id = ?',
      [userId]
    );
    
    res.status(200).json({
      success: true,
      data: stores
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * Create a new store
 */
const createStore = asyncHandler(async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await pool.getConnection();
    
    // Create a new store
    const [result] = await connection.execute(
      'INSERT INTO stores (name, address, owner_id, created_at) VALUES (?, ?, ?, NOW())',
      [req.body.name, req.body.address, userId]
    );
    
    res.status(201).json({
      success: true,
      data: { id: result.insertId, ...req.body }
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = {
  getOwnerStats,
  getOwnerStores,
  getOwnerCustomers,
  createStore
};
