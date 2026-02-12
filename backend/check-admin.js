require('dotenv').config();

async function checkAdminUser() {
  console.log('🔍 Checking Admin User in Database\n');

  try {
    const database = require('./src/config/database');
    const connection = await database.getConnection();
    
    // Check if admin user exists
    const [adminUsers] = await connection.execute(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
      ['admin@storereview.com']
    );
    
    console.log('Admin users found:', adminUsers.length);
    
    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log('✅ Admin user found:');
      console.log('- ID:', admin.id);
      console.log('- Name:', admin.name);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- Active:', admin.is_active);
      console.log('- Password hash exists:', !!admin.password_hash);
      console.log('- Password hash length:', admin.password_hash.length);
      
      // Test password verification
      const bcrypt = require('bcryptjs');
      const testPassword = 'Admin@123456';
      const isPasswordValid = await bcrypt.compare(testPassword, admin.password_hash);
      console.log('- Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.log('❌ Admin user NOT found in database!');
      console.log('Running database initialization...');
      
      // Try to create admin user
      const { initializeDatabase } = require('./src/config/database');
      const initResult = await initializeDatabase();
      console.log('Database initialization result:', initResult);
    }
    
    connection.release();
    
    // Test database connection
    const isConnected = await database.testConnection();
    console.log('\n📊 Database connection status:', isConnected ? '✅ Connected' : '❌ Disconnected');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminUser();
