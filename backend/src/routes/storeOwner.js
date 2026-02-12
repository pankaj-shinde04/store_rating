const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getOwnerStats,
  getOwnerStores,
  getOwnerCustomers,
  createStore
} = require('../controllers/storeOwnerController');

const router = express.Router();

/**
 * @route   GET /api/stores/owner/stats
 * @desc    Get store owner dashboard statistics
 * @access   Private (Store Owner only)
 */
router.get('/stats', authenticate, authorize('store_owner'), getOwnerStats);

/**
 * @route   GET /api/stores/owner
 * @desc    Get all stores for store owner
 * @access   Private (Store Owner only)
 */
router.get('/', authenticate, authorize('store_owner'), getOwnerStores);

/**
 * @route   GET /api/stores/owner/customers
 * @desc    Get customers who rated owner's stores
 * @access   Private (Store Owner only)
 */
router.get('/customers', authenticate, authorize('store_owner'), getOwnerCustomers);

/**
 * @route   POST /api/stores
 * @desc    Create new store
 * @access   Private (Store Owner only)
 */
router.post('/', authenticate, authorize('store_owner'), createStore);

module.exports = router;
