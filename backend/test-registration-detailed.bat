@echo off
echo 🔍 Testing Registration with Detailed Debug
echo.

echo 1. Testing with all required fields...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"Password123\",\"confirmPassword\":\"Password123\",\"role\":\"normal_user\"}"
echo.
echo.

echo 2. Testing with missing confirmPassword...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john2@example.com\",\"password\":\"Password123\",\"role\":\"normal_user\"}"
echo.
echo.

echo 3. Testing with short name...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"J\",\"email\":\"john3@example.com\",\"password\":\"Password123\",\"confirmPassword\":\"Password123\",\"role\":\"normal_user\"}"
echo.
echo.

echo 4. Testing with short password...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john4@example.com\",\"password\":\"123\",\"confirmPassword\":\"123\",\"role\":\"normal_user\"}"
echo.
echo.

pause
