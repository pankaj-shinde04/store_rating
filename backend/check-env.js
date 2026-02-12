const fs = require('fs');
const path = require('path');

// Read the current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Current .env file content:');
  console.log('---');
  console.log(envContent);
  console.log('---');
} else {
  console.log('.env file does not exist');
}

// Check if DB_PASSWORD is properly set
const dbPasswordLine = envContent.split('\n').find(line => line.startsWith('DB_PASSWORD='));
if (dbPasswordLine) {
  console.log('Found DB_PASSWORD line:', dbPasswordLine);
  if (dbPasswordLine === 'DB_PASSWORD=') {
    console.log('❌ DB_PASSWORD is empty');
    console.log('Please update it to: DB_PASSWORD=your_actual_password');
  } else {
    console.log('✅ DB_PASSWORD appears to be set');
  }
} else {
  console.log('❌ DB_PASSWORD line not found in .env file');
}
