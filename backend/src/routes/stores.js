const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadStorePhoto, handleUploadError } = require('../middlewares/upload');
const { validateStoreCreation, validateStoreUpdate, validateStoreQuery } = require('../validators/storeValidator');
const {
  getAllStores,
  getAllStoresForUsers,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoreCategories
} = require('../controllers/storesController');
const { getOwnerStores, getOwnerStats, getOwnerCustomers } = require('../controllers/storeOwnerController');

const router = express.Router();

/**
 * @route   GET /api/stores
 * @desc    Get all stores with search, filtering, and pagination
 * @access   Public
 */
router.get('/', validateStoreQuery, getAllStores);

/**
 * @route   GET /api/stores/user
 * @desc    Get all stores for user dashboard (simplified)
 * @access   Private (Authenticated users)
 */
router.get('/user', authenticate, getAllStoresForUsers);

/**
 * @route   GET /api/stores/owner
 * @desc    Get all stores for the authenticated store owner
 * @access   Private (Store Owner only)
 */
router.get('/owner', authenticate, authorize('store_owner'), getOwnerStores);

/**
 * @route   GET /api/stores/owner/stats
 * @desc    Get store owner dashboard statistics
 * @access   Private (Store Owner only)
 */
router.get('/owner/stats', authenticate, authorize('store_owner'), getOwnerStats);

/**
 * @route   GET /api/stores/owner/customers
 * @desc    Get customers who rated owner's stores
 * @access   Private (Store Owner only)
 */
router.get('/owner/customers', authenticate, authorize('store_owner'), getOwnerCustomers);

/**
 * @route   GET /api/stores/categories
 * @desc    Get all store categories
 * @access   Public
 */
router.get('/categories', getStoreCategories);

/**
 * @route   GET /api/stores/:id
 * @desc    Get store by ID with full details
 * @access   Public
 */
router.get('/:id', getStoreById);

/**
 * @route   POST /api/stores
 * @desc    Create new store with photo upload
 * @access   Private (Store Owner only)
 */
router.post('/', 
  authenticate, 
  authorize('store_owner'), 
  uploadStorePhoto, 
  handleUploadError,
  validateStoreCreation, 
  createStore
);

/**
 * @route   PUT /api/stores/:id
 * @desc    Update store with photo upload
 * @access   Private (Store Owner or Admin)
 */
router.put('/:id', 
  authenticate, 
  authorize(['store_owner', 'admin']), 
  uploadStorePhoto, 
  handleUploadError,
  validateStoreUpdate, 
  updateStore
);

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete store
 * @access   Private (Store Owner or Admin)
 */
router.delete('/:id', 
  authenticate, 
  authorize(['store_owner', 'admin']), 
  deleteStore
);

module.exports = router;
