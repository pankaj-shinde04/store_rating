# Authentication Module Testing Guide

## Quick Test with curl Commands

### 1. Test User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "normal_user",
    "address": "123 Main St, City, State"
  }'
```

### 2. Test User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "normal_user"
  }'
```

### 3. Test Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@storereview.com",
    "password": "Admin@123456",
    "role": "admin"
  }'
```

### 4. Test Duplicate Registration (should fail)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "normal_user"
  }'
```

## Expected Results

### Registration Success Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "normal_user",
      "createdAt": "2026-02-10T11:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Login Success Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "normal_user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Duplicate Registration Error (409):
```json
{
  "success": false,
  "error": "Email already exists",
  "message": "Email already exists",
  "code": "Duplicate Entry"
}
```

## Testing Steps

1. **Start the backend server:**
   ```bash
   cd G:\Assignment\backend
   npm run dev
   ```

2. **Run the registration command** - Should create a new user

3. **Run the login command** - Should authenticate and return tokens

4. **Run the admin login** - Should authenticate the default admin user

5. **Run duplicate registration** - Should return an error

## Database Verification

After running the tests, you can verify the data was stored in the database:

```sql
-- Check if users were created
SELECT id, name, email, role, created_at FROM users;

-- Check the admin user
SELECT * FROM users WHERE email = 'admin@storereview.com';
```

## Frontend Integration

The authentication module is now ready for frontend integration. The frontend should:

1. Send registration data to `/api/auth/register`
2. Send login data to `/api/auth/login`
3. Store the received tokens securely
4. Include the access token in the `Authorization` header for protected routes
5. Use the refresh token to get new access tokens when needed

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens expire: Access (15 minutes), Refresh (7 days)
- All inputs are validated and sanitized
- SQL injection protection with parameterized queries
- Role-based access control implemented
