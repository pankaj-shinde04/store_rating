const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
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
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require admin role
router.use(authenticate);
router.use(authorize(['admin']));

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats', getAdminStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/users', getAllUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/users', createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/users/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   POST /api/admin/users/bulk
 * @desc    Bulk user operations (activate/deactivate)
 * @access  Private (Admin only)
 */
router.post('/users/bulk', bulkUserOperation);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/users/stats', getUserStatistics);

/**
 * @route   GET /api/admin/stores
 * @desc    Get all stores with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/stores', getAllStores);

/**
 * @route   GET /api/admin/stores/:id
 * @desc    Get store by ID with details
 * @access  Private (Admin only)
 */
router.get('/stores/:id', getStoreById);

/**
 * @route   GET /api/admin/stores/:id/analytics
 * @desc    Get store analytics
 * @access  Private (Admin only)
 */
router.get('/stores/:id/analytics', getStoreAnalytics);

/**
 * @route   PUT /api/admin/stores/:id/approve
 * @desc    Approve store
 * @access  Private (Admin only)
 */
router.put('/stores/:id/approve', approveStore);

/**
 * @route   PUT /api/admin/stores/:id/reject
 * @desc    Reject store
 * @access  Private (Admin only)
 */
router.put('/stores/:id/reject', rejectStore);

/**
 * @route   PUT /api/admin/stores/:id
 * @desc    Update store
 * @access  Private (Admin only)
 */
router.put('/stores/:id', updateStore);

/**
 * @route   POST /api/admin/stores/bulk
 * @desc    Bulk store operations (approve/reject)
 * @access  Private (Admin only)
 */
router.post('/stores/bulk', bulkStoreOperation);

/**
 * @route   GET /api/admin/stores/attention
 * @desc    Get stores requiring attention
 * @access  Private (Admin only)
 */
router.get('/stores/attention', getStoresRequiringAttention);

/**
 * @route   GET /api/admin/stores/stats
 * @desc    Get store statistics
 * @access  Private (Admin only)
 */
router.get('/stores/stats', getStoreStatistics);

/**
 * @route   GET /api/admin/ratings
 * @desc    Get all ratings with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/ratings', getAllRatings);

/**
 * @route   DELETE /api/admin/ratings/:id
 * @desc    Get rating statistics
 * @access  Private (Admin only)
 */
router.get('/ratings/statistics', getRatingStatistics);

/**
 * @route   GET /api/admin/ratings/attention
 * @desc    Get ratings requiring attention
 * @access  Private (Admin only)
 */
router.get('/ratings/attention', getRatingsRequiringAttention);

/**
 * @route   POST /api/admin/ratings/bulk
 * @desc    Bulk rating operations
 * @access  Private (Admin only)
 */
router.post('/ratings/bulk', bulkRatingOperation);

/**
 * @route   PUT /api/admin/ratings/:id/approve
 * @desc    Approve a rating
 * @access  Private (Admin only)
 */
router.put('/ratings/:id/approve', approveRating);

/**
 * @route   PUT /api/admin/ratings/:id/reject
 * @desc    Reject a rating
 * @access  Private (Admin only)
 */
router.put('/ratings/:id/reject', rejectRating);

/**
 * @route   DELETE /api/admin/ratings/:id
 * @desc    Delete a rating
 * @access  Private (Admin only)
 */
router.delete('/ratings/:id', deleteRating);

/**
 * @route   GET /api/admin/recent-users
 * @desc    Get recent users for admin dashboard (legacy)
 * @access  Private (Admin only)
 */
router.get('/recent-users', getRecentUsers);

/**
 * @route   GET /api/admin/recent-stores
 * @desc    Get recent stores for admin dashboard (legacy)
 * @access  Private (Admin only)
 */
router.get('/recent-stores', getRecentStores);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details
 * @access  Private (Admin only)
 */
router.get('/users/:userId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get user details endpoint - Coming Soon',
    params: req.params
  });
});

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/users/:userId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update user endpoint - Coming Soon',
    params: req.params
  });
});

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete user endpoint - Coming Soon',
    params: req.params
  });
});

/**
 * @route   GET /api/admin/stores/:storeId
 * @desc    Get store details
 * @access  Private (Admin only)
 */
router.get('/stores/:storeId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get store details endpoint - Coming Soon',
    params: req.params
  });
});

/**
 * @route   GET /api/admin/statistics
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/statistics', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get system statistics endpoint - Coming Soon'
  });
});

module.exports = router;
