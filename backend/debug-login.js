require('dotenv').config();

async function debugLogin() {
  console.log('🔍 Debugging Login Authentication\n');

  try {
    // Test 1: Check if admin user exists in database
    console.log('1️⃣ Checking admin user in database...');
    const database = require('./src/config/database');
    const connection = await database.getConnection();
    
    const [adminUsers] = await connection.execute(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
      ['admin@storereview.com']
    );
    
    console.log('Admin users found:', adminUsers.length);
    if (adminUsers.length > 0) {
      console.log('Admin user details:');
      console.log('- ID:', adminUsers[0].id);
      console.log('- Email:', adminUsers[0].email);
      console.log('- Role:', adminUsers[0].role);
      console.log('- Active:', adminUsers[0].is_active);
      console.log('- Password hash length:', adminUsers[0].password_hash.length);
    } else {
      console.log('❌ No admin user found!');
    }
    
    connection.release();

    // Test 2: Test login API directly
    console.log('\n2️⃣ Testing login API...');
    const fetch = require('node-fetch');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@storereview.com',
        password: 'Admin@123456',
        role: 'admin'
      })
    });

    console.log('Response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Response data:', JSON.stringify(loginData, null, 2));

    // Test 3: Check database connection
    console.log('\n3️⃣ Testing database connection...');
    const isConnected = await database.testConnection();
    console.log('Database connected:', isConnected);

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Error details:', error);
  }
}

debugLogin();
