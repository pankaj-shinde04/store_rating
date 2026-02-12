const path = require('path');
const { pool } = require('../config/database');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { getFileInfo, deleteUploadedFile } = require('../middlewares/upload');

/**
 * Get all stores with search, filtering, and pagination
 */
const getAllStores = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const minRating = parseFloat(req.query.minRating) || 0;
    const maxRating = parseFloat(req.query.maxRating) || 5;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    const category = req.query.category || '';
    const isActive = req.query.is_active !== undefined ? req.query.is_active === 'true' : true;
    const isVerified = req.query.is_verified !== undefined ? req.query.is_verified === 'true' : undefined;
    
    const connection = await pool.getConnection();
    
    // Build WHERE clause
    let whereClause = 'WHERE s.is_active = ?';
    let params = [isActive];
    
    if (search) {
      whereClause += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (minRating > 0) {
      whereClause += ' AND (s.average_rating >= ?)';
      params.push(minRating);
    }
    
    if (maxRating < 5) {
      whereClause += ' AND (s.average_rating <= ?)';
      params.push(maxRating);
    }
    
    if (category) {
      whereClause += ' AND (s.category = ?)';
      params.push(category);
    }
    
    if (isVerified !== undefined) {
      whereClause += ' AND (s.is_verified = ?)';
      params.push(isVerified);
    }
    
    // Build ORDER BY clause
    let orderByClause = 'ORDER BY ';
    switch (sortBy) {
      case 'rating':
        orderByClause += 's.average_rating DESC';
        break;
      case 'rating_count':
        orderByClause += 'rating_count DESC';
        break;
      case 'created_at':
        orderByClause += 's.created_at DESC';
        break;
      case 'updated_at':
        orderByClause += 's.updated_at DESC';
        break;
      case 'category':
        orderByClause += 's.category ASC';
        break;
      default:
        orderByClause += `s.name ${sortOrder}`;
    }
    
    // Get total count for pagination
    const [countResult] = await connection.execute(
      `SELECT COUNT(DISTINCT s.id) as totalStores
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       ${whereClause}`,
      params
    );
    
    // Get stores with ratings and owner info
    const [stores] = await connection.execute(
      `SELECT s.id, s.name, s.address, s.created_at, s.updated_at, s.is_active,
              u.name as owner_name,
              COUNT(r.id) as rating_count,
              AVG(r.rating_value) as average_rating
       FROM stores s
       JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       ${whereClause}
       GROUP BY s.id, u.id
       ${orderByClause}
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    
    connection.release();
    
    const totalStores = countResult[0]?.totalStores || 0;
    const totalPages = Math.ceil(totalStores / limit);
    
    res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully',
      data: {
        stores,
        pagination: {
          currentPage: page,
          totalPages,
          totalStores,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting stores:', error);
    throw new AppError('Failed to retrieve stores', 500);
  }
});

/**
 * Get store by ID with full details
 */
const getStoreById = asyncHandler(async (req, res) => {
  try {
    const storeId = req.params.id;
    const connection = await pool.getConnection();
    
    const [stores] = await connection.execute(
      `SELECT s.id, s.name, s.address, s.created_at, s.updated_at, s.is_active,
              u.name as owner_name, u.email as owner_email,
              COUNT(r.id) as rating_count,
              AVG(r.rating_value) as average_rating
       FROM stores s
       JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id, u.id`,
      [storeId]
    );
    
    if (stores.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    // Get store ratings with user info
    const [ratings] = await connection.execute(
      `SELECT r.id, r.rating_value, r.review_text, r.created_at,
              u.name as user_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [storeId]
    );
    
    connection.release();
    
    const store = stores[0];
    store.ratings = ratings;
    
    res.status(200).json({
      success: true,
      message: 'Store retrieved successfully',
      data: store
    });
  } catch (error) {
    console.error('Error getting store:', error);
    throw new AppError('Failed to retrieve store', 500);
  }
});

/**
 * Create new store with photo upload
 */
const createStore = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { name, address, description, phone, email, website, category } = req.body;
    const userId = req.user.id;
    
    // Check if store name already exists for this owner
    const [existingStores] = await connection.execute(
      'SELECT id FROM stores WHERE owner_id = ? AND name = ?',
      [userId, name]
    );
    
    if (existingStores.length > 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      return res.status(409).json({
        success: false,
        error: 'Store name already exists for your account',
        details: [{ field: 'name', message: 'Store name must be unique for your account' }]
      });
    }
    
    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    // Create new store
    const [result] = await connection.execute(
      `INSERT INTO stores (name, address, description, phone, email, website, category, photo_url, owner_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, description, phone, email, website, category, photoUrl, userId]
    );
    
    connection.release();
    
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: {
        id: result.insertId,
        name,
        address,
        description,
        phone,
        email,
        website,
        category,
        photo_url: photoUrl,
        owner_id: userId,
        is_active: true,
        is_verified: false
      }
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }
    connection.release();
    console.error('Error creating store:', error);
    throw new AppError('Failed to create store', 500);
  }
});

/**
 * Update store with photo upload
 */
const updateStore = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { name, address, description, phone, email, website, category, is_active } = req.body;
    
    // Convert undefined to null for MySQL compatibility
    const safeName = name !== undefined ? name : null;
    const safeAddress = address !== undefined ? address : null;
    const safeDescription = description !== undefined ? description : null;
    const safePhone = phone !== undefined ? phone : null;
    const safeEmail = email !== undefined ? email : null;
    const safeWebsite = website !== undefined ? website : null;
    const safeCategory = category !== undefined ? category : null;
    const safeIsActive = is_active !== undefined ? is_active : null;
    
    // Check if store exists and belongs to user
    const [existingStores] = await connection.execute(
      'SELECT id, photo_url, owner_id FROM stores WHERE id = ?',
      [storeId]
    );
    
    if (existingStores.length === 0) {
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    const store = existingStores[0];
    
    // Check if user owns the store or is admin
    if (store.owner_id !== userId && req.user.role !== 'admin') {
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      return res.status(403).json({
        success: false,
        error: 'You can only update your own stores'
      });
    }
    
    // Handle photo update
    let photoUrl = store.photo_url;
    if (req.file) {
      // Delete old photo if exists
      if (store.photo_url) {
        const oldPhotoPath = path.join(__dirname, '../../uploads', path.basename(store.photo_url));
        deleteUploadedFile(oldPhotoPath);
      }
      photoUrl = `/uploads/${req.file.filename}`;
    }
    
    // Update store
    const [result] = await connection.execute(
      `UPDATE stores 
       SET name = ?, address = ?, description = ?, phone = ?, email = ?, 
           website = ?, category = ?, photo_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [safeName, safeAddress, safeDescription, safePhone, safeEmail, safeWebsite, safeCategory, photoUrl, safeIsActive, storeId]
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: {
        id: parseInt(storeId),
        name: safeName,
        address: safeAddress,
        description: safeDescription,
        phone: safePhone,
        email: safeEmail,
        website: safeWebsite,
        category: safeCategory,
        photo_url: photoUrl,
        is_active: safeIsActive,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }
    connection.release();
    console.error('Error updating store:', error);
    throw new AppError('Failed to update store', 500);
  }
});

/**
 * Delete store
 */
const deleteStore = asyncHandler(async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    
    // Check if store exists and belongs to user
    const [existingStores] = await connection.execute(
      'SELECT id, photo_url, owner_id FROM stores WHERE id = ?',
      [storeId]
    );
    
    if (existingStores.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    const store = existingStores[0];
    
    // Check if user owns the store or is admin
    if (store.owner_id !== userId && req.user.role !== 'admin') {
      connection.release();
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own stores'
      });
    }
    
    // Delete store photo if exists
    if (store.photo_url) {
      const photoPath = path.join(__dirname, '../../uploads', path.basename(store.photo_url));
      deleteUploadedFile(photoPath);
    }
    
    // Delete store (cascade will handle ratings)
    await connection.execute('DELETE FROM stores WHERE id = ?', [storeId]);
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    throw new AppError('Failed to delete store', 500);
  }
});

/**
 * Get store categories
 */
const getStoreCategories = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Try to get categories, fall back if column doesn't exist
    let [categories] = [];
    try {
      [categories] = await connection.execute(
        'SELECT DISTINCT category FROM stores WHERE category IS NOT NULL AND category != "" ORDER BY category ASC'
      );
    } catch (error) {
      console.log('Category column not available yet, using fallback');
      // Fallback categories if column doesn't exist
      categories = [
        { category: 'Restaurant' },
        { category: 'Coffee Shop' },
        { category: 'Retail' },
        { category: 'Service' },
        { category: 'Entertainment' },
        { category: 'Other' }
      ];
    }
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories.map(cat => cat.category)
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    throw new AppError('Failed to retrieve categories', 500);
  }
});

/**
 * Get all stores for user dashboard (simplified version without pagination)
 */
const getAllStoresForUsers = asyncHandler(async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get all active stores with ratings and owner info
    const [stores] = await connection.execute(
      `SELECT s.id, s.name, s.address, s.category, s.created_at, s.updated_at, s.is_active,
              u.name as owner_name,
              COUNT(r.id) as rating_count,
              AVG(r.rating_value) as average_rating
       FROM stores s
       JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.is_active = true
       GROUP BY s.id, u.id
       ORDER BY s.name ASC`
    );
    
    connection.release();
    
    res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully',
      data: stores
    });
  } catch (error) {
    console.error('Error getting stores for users:', error);
    throw new AppError('Failed to retrieve stores', 500);
  }
});

module.exports = {
  getAllStores,
  getAllStoresForUsers,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoreCategories
};
