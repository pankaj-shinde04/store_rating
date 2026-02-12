const { pool } = require('./src/config/database');

async function updateUserRole() {
  try {
    const connection = await pool.getConnection();
    
    // Update user role - replace with actual email
    const [result] = await connection.execute(
      'UPDATE users SET role = ? WHERE email = ?',
      ['store_owner', 'your-email@example.com']
    );
    
    console.log(`Updated ${result.affectedRows} user(s) to store_owner role`);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

updateUserRole();
