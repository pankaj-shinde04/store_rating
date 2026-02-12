require('dotenv').config();
const database = require('./src/config/database');

console.log('Attempting to get database connection...');

database.getConnection()
  .then(connection => {
    console.log('✅ SUCCESS: Database connected');
    connection.release();
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ FAILED: Database connection error');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    process.exit(1);
  });
