@echo off
echo 🔍 Testing Exact Frontend Data
echo.

echo Testing with Pankaj Shinde data...
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Pankaj Shinde\",\"email\":\"pankajshinde2434@gmail.com\",\"password\":\"pass@123\",\"confirmPassword\":\"pass@123\",\"role\":\"normal_user\",\"address\":\"\"}"
echo.
echo.

pause
