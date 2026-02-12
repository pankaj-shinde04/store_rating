require('dotenv').config();

console.log('🔍 Checking Database Connection Status\n');

async function checkDatabaseConnection() {
  try {
    const database = require('./src/config/database');
    
    console.log('1. Testing basic database connection...');
    const isConnected = await database.testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection: SUCCESS');
      
      console.log('\n2. Testing database table access...');
      const connection = await database.getConnection();
      
      // Check if users table exists and has data
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table accessible. Total users: ${users[0].count}`);
      
      // Check if admin user exists
      const [adminUsers] = await connection.execute(
        'SELECT id, name, email, role FROM users WHERE role = ? LIMIT 1',
        ['admin']
      );
      
      if (adminUsers.length > 0) {
        console.log('✅ Admin user found:');
        console.log(`   Email: ${adminUsers[0].email}`);
        console.log(`   Name: ${adminUsers[0].name}`);
        console.log(`   Role: ${adminUsers[0].role}`);
      } else {
        console.log('⚠️  No admin user found');
      }
      
      connection.release();
      
      console.log('\n3. Database Configuration:');
      console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`   Port: ${process.env.DB_PORT || 3306}`);
      console.log(`   Database: ${process.env.DB_NAME || 'store_rating_platform'}`);
      console.log(`   User: ${process.env.DB_USER || 'root'}`);
      console.log(`   Password: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT SET'}`);
      
    } else {
      console.log('❌ Database connection: FAILED');
      console.log('\nTroubleshooting steps:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if database "store_rating_platform" exists');
      console.log('3. Verify .env file has correct database credentials');
      console.log('4. Check if MySQL user has proper permissions');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Access denied - Check your MySQL password in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database not found - Run "npm run init-db" to create database');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - MySQL server might not be running');
    }
  }
}

// Run the check
checkDatabaseConnection();
