require('dotenv').config();
const app = require('./app');
const database = require('./config/database');

const PORT = process.env.PORT || 3001;

// Start server with database connection
database.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to connect to database:', error.message);
    console.log('⚠️  Starting server without database...');
    
    // Fallback: start server without database
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} (Mock Mode)`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});
