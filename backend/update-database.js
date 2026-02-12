const { initializeDatabase } = require('./src/config/database');

initializeDatabase()
  .then(() => {
    console.log('✅ Database updated successfully!');
    console.log('📊 New columns added:');
    console.log('   - stores: description, phone, email, website, category, photo_url, photo_public_id, is_verified');
    console.log('   - ratings: owner_response');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database update failed:', err);
    process.exit(1);
  });
