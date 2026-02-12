@echo off
echo 🔍 Debugging Login Issues
echo.

echo 1. Testing server health...
curl -s http://localhost:3001/api/health
echo.
echo.

echo 2. Testing admin login with curl...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@storereview.com\",\"password\":\"Admin@123456\",\"role\":\"admin\"}"
echo.
echo.

echo 3. Testing with wrong password (should fail)...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@storereview.com\",\"password\":\"wrongpassword\",\"role\":\"admin\"}"
echo.
echo.

echo 4. Testing with wrong role (should fail)...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@storereview.com\",\"password\":\"Admin@123456\",\"role\":\"normal_user\"}"
echo.
echo.

pause
