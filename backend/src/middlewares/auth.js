const { verifyAccessToken } = require('../config/jwt');
const { pool } = require('../config/database');

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid token'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database to ensure they still exist and are active
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          message: 'The user associated with this token no longer exists'
        });
      }
      
      const user = users[0];
      
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired, please login again'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Authorization middleware - checks if user has required role
 * @param {String|Array} roles - Required role(s)
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    console.log('🔍 Authorization check:');
    console.log('🔍 Required roles:', allowedRoles);
    console.log('🔍 User role:', req.user.role);
    console.log('🔍 User data:', req.user);
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log('🔍 Authorization failed - role not allowed');
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
    }
    
    console.log('🔍 Authorization successful');
    next();
  };
};

/**
 * Optional authentication middleware - attaches user if token is valid but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without authentication
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
        [decoded.id]
      );
      
      if (users.length > 0 && users[0].is_active) {
        req.user = users[0];
      }
    } finally {
      connection.release();
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
