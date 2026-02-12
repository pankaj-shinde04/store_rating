const mysql = require('mysql2/promise');

// Database connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Pankajshinde_04',
  database: process.env.DB_NAME || 'store_rating_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('normal_user', 'store_owner', 'admin') NOT NULL DEFAULT 'normal_user',
        address VARCHAR(400),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_created_at (created_at)
      )
    `);
    
    // Create stores table with photo support
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT NOT NULL,
        photo_url VARCHAR(500),
        photo_public_id VARCHAR(200),
        description TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        category VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_owner (owner_id),
        INDEX idx_name (name),
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_created_at (created_at)
      )
    `);
    
    // Create ratings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating_value INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        rejection_reason TEXT NULL,
        review_text TEXT,
        owner_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store (user_id, store_id),
        INDEX idx_user (user_id),
        INDEX idx_store (store_id),
        INDEX idx_rating (rating_value),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        
        CONSTRAINT chk_rating_value CHECK (rating_value BETWEEN 1 AND 5)
      )
    `);
    
    // Create user_favorites table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store_favorite (user_id, store_id),
        INDEX idx_user_favorites (user_id),
        INDEX idx_store_favorites (store_id),
        INDEX idx_created_at_favorites (created_at)
      )
    `);
    
    // Insert default admin user if not exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@storereview.com']
    );
    
    if (existingAdmin.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin@123456', 12);
      
      await connection.execute(`
        INSERT INTO users (name, email, password_hash, role) 
        VALUES (?, ?, ?, ?)
      `, ['System Administrator', 'admin@storereview.com', hashedPassword, 'admin']);
      
      console.log('📝 Default admin user created: admin@storereview.com / Admin@123456');
    }
    
    connection.release();
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Export pool and utility functions
module.exports = {
  pool,
  getConnection: () => pool.getConnection(),
  testConnection: async () => {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },
  initializeDatabase
};
