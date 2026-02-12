# Authentication Module API Documentation

## Overview
The authentication module provides user registration, login, and token management functionality with database persistence.

## Base URL
```
http://localhost:3001/api/auth
```

## Endpoints

### 1. Register New User
**POST** `/register`

Creates a new user account and stores it in the database.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "normal_user", // Options: "normal_user", "store_owner", "admin"
  "address": "123 Main St, City, State" // Optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
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

**Error Responses:**
- `400` - Validation failed
- `409` - Email already exists

### 2. User Login
**POST** `/login`

Authenticates a user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "normal_user"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
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

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid credentials or role mismatch

### 3. Refresh Access Token
**POST** `/refresh-token`

Generates a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 4. Change Password
**PUT** `/change-password`

Changes the password of an authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 5. Logout
**POST** `/logout`

Logs out an authenticated user (client-side token removal).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Default Admin User
The system includes a default admin user:
- **Email:** `admin@storereview.com`
- **Password:** `Admin@123456`
- **Role:** `admin`

## Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT-based authentication with access and refresh tokens
- Role-based access control
- Input validation and sanitization
- SQL injection protection with parameterized queries

## Testing
Use the provided test script to verify all functionality:
```bash
node test-auth-module.js
```

## Database Tables
The authentication module uses the `users` table with the following structure:
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - Hashed password
- `role` - User role (normal_user, store_owner, admin)
- `address` - User address (optional)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `is_active` - Account status flag
