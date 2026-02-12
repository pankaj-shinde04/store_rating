@echo off
echo 🔍 Testing Backend Server and Database Connection
echo.

echo 1. Testing server health check...
curl -s http://localhost:3001/api/health
echo.
echo.

echo 2. Testing admin login...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@storereview.com\",\"password\":\"Admin@123456\",\"role\":\"admin\"}"
echo.
echo.

echo 3. Testing user registration...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Password123!\",\"role\":\"normal_user\"}"
echo.
echo.

echo ✅ Test completed!
pause
