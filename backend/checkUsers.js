const { pool } = require('./src/config/database');

async function checkAllUsers() {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, name, email, role, is_active FROM users ORDER BY created_at DESC'
    );
    
    console.log('All users:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
    });
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkAllUsers();
