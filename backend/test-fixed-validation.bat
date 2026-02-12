@echo off
echo 🔧 Testing Fixed Validation Rules
echo.

echo 1. Testing registration with valid data...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"Password123\",\"confirmPassword\":\"Password123\",\"role\":\"normal_user\"}"
echo.
echo.

echo 2. Testing admin login...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@storereview.com\",\"password\":\"Admin@123456\",\"role\":\"admin\"}"
echo.
echo.

echo 3. Testing new user login...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"Password123\",\"role\":\"normal_user\"}"
echo.
echo.

pause
