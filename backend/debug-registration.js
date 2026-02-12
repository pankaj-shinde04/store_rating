require('dotenv').config();

async function debugRegistration() {
  console.log('🔍 Debugging Registration Issues\n');

  try {
    const fetch = require('node-fetch');
    
    // Test 1: Check what validation errors occur
    console.log('1️⃣ Testing registration with valid data...');
    
    const validData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      role: 'normal_user',
      address: '123 Main St, City, State'
    };
    
    console.log('Sending data:', JSON.stringify(validData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validData)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Test 2: Test with minimal required fields
    console.log('\n2️⃣ Testing with minimal data...');
    
    const minimalData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'normal_user'
    };
    
    console.log('Sending minimal data:', JSON.stringify(minimalData, null, 2));
    
    const minimalResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData)
    });

    console.log('Minimal response status:', minimalResponse.status);
    const minimalDataResponse = await minimalResponse.json();
    console.log('Minimal response:', JSON.stringify(minimalDataResponse, null, 2));

    // Test 3: Check validation rules
    console.log('\n3️⃣ Testing validation failures...');
    
    const invalidTests = [
      { name: '', email: 'test@example.com', password: 'Password123!', role: 'normal_user', desc: 'Empty name' },
      { name: 'Test', email: 'invalid-email', password: 'Password123!', role: 'normal_user', desc: 'Invalid email' },
      { name: 'Test', email: 'test@example.com', password: '123', role: 'normal_user', desc: 'Short password' },
      { name: 'Test', email: 'test@example.com', password: 'Password123!', role: 'invalid_role', desc: 'Invalid role' }
    ];

    for (const test of invalidTests) {
      console.log(`\nTesting: ${test.desc}`);
      const testData = { name: test.name, email: test.email, password: test.password, role: test.role };
      
      const testResponse = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const testDataResult = await testResponse.json();
      console.log(`Status: ${testResponse.status}, Error: ${testDataResult.error || testDataResult.message}`);
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugRegistration();
