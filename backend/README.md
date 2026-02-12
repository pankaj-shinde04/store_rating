# Store Rating Platform – Backend

## Project Overview

The Store Rating Platform backend is a Node.js REST API that serves as the foundation for the store rating and review system. It handles user authentication, store management, rating submissions, and provides role-based access control for Normal Users, Store Owners, and Administrators. The backend processes all business logic, data validation, and database operations while supporting the frontend through well-defined RESTful endpoints.

## System Roles & Permissions

### Normal User
- **Permissions**: View stores, submit ratings, edit own ratings, manage profile
- **Access**: Public store data, personal profile and ratings
- **Restrictions**: Cannot access other users' data, store owner analytics, or admin functions

### Store Owner
- **Permissions**: View owned store details, monitor ratings, see user feedback, manage store information
- **Access**: Store performance metrics, user ratings for their stores, store management
- **Restrictions**: Cannot access other stores' data, user management, or system administration

### Admin (Full Access)
- **Permissions**: Complete system access, user management, store oversight, system statistics
- **Access**: All user data, all store data, system analytics, administrative operations
- **Restrictions**: None - has complete control over the platform

## Backend Architecture

### High-Level Architecture
The backend follows a layered architecture with clear separation of concerns:

```
Request → Middleware → Routes → Controllers → Services → Models → Database
```

### Architecture Components

**Routes Layer**: Define API endpoints and HTTP methods
- Map URLs to controller functions
- Apply authentication and authorization middleware
- Route versioning support

**Controllers Layer**: Handle HTTP requests and responses
- Parse request data and validate inputs
- Call appropriate service methods
- Format responses and handle errors
- Manage HTTP status codes

**Services Layer**: Implement business logic
- Process complex operations and calculations
- Coordinate between multiple models
- Handle data transformations
- Implement caching strategies

**Models Layer**: Database interaction layer
- Define database schemas and relationships
- Execute database queries
- Handle data validation at database level
- Manage database connections

**Middleware Layer**: Cross-cutting concerns
- Authentication and authorization
- Request validation
- Error handling
- Logging and monitoring

### Request Flow Example
1. **Request**: Client sends HTTP request to API endpoint
2. **Middleware**: Authentication, validation, logging
3. **Route**: Maps request to appropriate controller
4. **Controller**: Validates input, calls service
5. **Service**: Executes business logic, interacts with models
6. **Model**: Performs database operations
7. **Response**: Data flows back through layers to client

## Authentication & Authorization

### JWT-Based Authentication
**Token Generation**:
- Generate access token (15 minutes expiry)
- Generate refresh token (7 days expiry)
- Include user ID, role, and permissions in payload
- Sign tokens with secure secret key

**Login Flow**:
1. User submits email and password
2. Validate credentials against database
3. Generate JWT tokens on successful authentication
4. Return tokens to client
5. Store refresh token securely (optional)

**Signup Flow**:
1. Validate user input data
2. Check email uniqueness
3. Hash password using bcrypt
4. Create user record in database
5. Generate authentication tokens
6. Return user data and tokens

### Password Hashing with bcrypt
- **Salt Rounds**: Use 12 salt rounds for optimal security
- **Hashing Process**: Automatically generate and store salt with hash
- **Verification**: Compare provided password with stored hash
- **Security**: Never store plain text passwords

### Role-Based Access Middleware
```javascript
// Middleware example (conceptual)
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
};
```

### Protected Routes and Permission Checks
**Route Protection**:
- Apply authentication middleware to protected routes
- Verify JWT token validity
- Extract user information from token payload
- Handle token expiration and refresh

**Permission Checks**:
- Role-based access control for different endpoints
- Resource ownership verification (users can only access their own data)
- Admin override for system-wide operations

## Database Design (MySQL)

### A. Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('normal_user', 'store_owner', 'admin') NOT NULL DEFAULT 'normal_user',
    address VARCHAR(400),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);
```

**Fields Description**:
- `id`: Primary key, auto-incrementing
- `name`: User's full name (20-60 characters)
- `email`: Unique email address for authentication
- `password_hash`: Bcrypt hashed password
- `role`: User role for access control
- `address`: Optional address field
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `is_active`: Account status (active/inactive)

**Constraints and Indexes**:
- Unique constraint on email field
- Indexes for email, role, and creation date for performance
- Role enum ensures valid role values

### B. Stores Table
```sql
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_name (name),
    INDEX idx_created_at (created_at)
);
```

**Fields Description**:
- `id`: Primary key, auto-incrementing
- `name`: Store name
- `address`: Store location address
- `owner_id`: Foreign key referencing users table
- `created_at`: Store registration timestamp
- `updated_at`: Last update timestamp
- `is_active`: Store status (active/inactive)

**Relationship with Store Owner**:
- One-to-many relationship: One user can own multiple stores
- Foreign key constraint ensures referential integrity
- Cascade delete removes stores when owner is deleted

### C. Ratings Table
```sql
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store_rating (user_id, store_id),
    INDEX idx_store_id (store_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating_value (rating_value),
    INDEX idx_created_at (created_at)
);
```

**Fields Description**:
- `id`: Primary key, auto-incrementing
- `user_id`: Foreign key referencing users table
- `store_id`: Foreign key referencing stores table
- `rating_value`: Rating from 1 to 5 stars
- `review_text`: Optional review text
- `created_at`: Rating submission timestamp
- `updated_at`: Last update timestamp

**User → Store Relationship**:
- One-to-many relationship: One user can rate multiple stores
- Unique constraint ensures one rating per user per store
- Check constraint validates rating values (1-5)

**Constraints**:
- Primary keys for unique identification
- Foreign keys for referential integrity
- Unique constraint for one rating per user per store
- Check constraint for rating value validation
- Indexes for performance optimization

## API Modules (VERY IMPORTANT)

### A. Authentication APIs

#### Signup
- **Purpose**: Register new Normal User accounts
- **Method**: POST `/api/auth/signup`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "address": "123 Main St, City, State"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "normal_user"
      },
      "tokens": {
        "accessToken": "jwt_access_token",
        "refreshToken": "jwt_refresh_token"
      }
    }
  }
  ```

#### Login
- **Purpose**: Authenticate existing users
- **Method**: POST `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```

#### Logout
- **Purpose**: Invalidate user tokens
- **Method**: POST `/api/auth/logout`
- **Access**: Authenticated users
- **Headers**: Authorization: Bearer <token>

#### Change Password
- **Purpose**: Update user password
- **Method**: PUT `/api/auth/change-password`
- **Access**: Authenticated users
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!"
  }
  ```

### B. User APIs (Normal User)

#### Get All Stores
- **Purpose**: Retrieve paginated list of all stores
- **Method**: GET `/api/stores`
- **Access**: Authenticated users
- **Query Parameters**: page, limit, search, sortBy, sortOrder

#### Search Stores
- **Purpose**: Search stores by name and address
- **Method**: GET `/api/stores/search`
- **Access**: Authenticated users
- **Query Parameters**: q (search query), page, limit

#### Submit Rating
- **Purpose**: Submit rating for a store
- **Method**: POST `/api/stores/:storeId/ratings`
- **Access**: Authenticated Normal Users
- **Request Body**:
  ```json
  {
    "ratingValue": 4,
    "reviewText": "Great store with excellent service!"
  }
  ```

#### Update Rating
- **Purpose**: Update existing rating
- **Method**: PUT `/api/ratings/:ratingId`
- **Access**: Rating owner
- **Request Body**:
  ```json
  {
    "ratingValue": 5,
    "reviewText": "Updated review: Even better than before!"
  }
  ```

#### View Own Profile
- **Purpose**: Get user profile information
- **Method**: GET `/api/users/profile`
- **Access**: Authenticated users

### C. Store Owner APIs

#### View Owner Dashboard
- **Purpose**: Get store owner dashboard data
- **Method**: GET `/api/owner/dashboard`
- **Access**: Store Owners only
- **Response**: Store performance metrics, ratings summary

#### Get Average Rating
- **Purpose**: Get average rating for owned stores
- **Method**: GET `/api/owner/stores/:storeId/average-rating`
- **Access**: Store Owner of the specific store

#### Get List of Users Who Rated Store
- **Purpose**: Get users who rated a specific store
- **Method**: GET `/api/owner/stores/:storeId/ratings`
- **Access**: Store Owner of the specific store
- **Query Parameters**: page, limit, ratingFilter

### D. Admin APIs

#### View All Users
- **Purpose**: Get paginated list of all users
- **Method**: GET `/api/admin/users`
- **Access**: Admin only
- **Query Parameters**: page, limit, role, search, sortBy, sortOrder

#### View All Stores
- **Purpose**: Get paginated list of all stores
- **Method**: GET `/api/admin/stores`
- **Access**: Admin only
- **Query Parameters**: page, limit, search, ownerFilter, sortBy, sortOrder

#### View System Statistics
- **Purpose**: Get platform-wide statistics
- **Method**: GET `/api/admin/statistics`
- **Access**: Admin only
- **Response**: User counts, store counts, rating statistics

#### Filter and Sort Data
- **Purpose**: Advanced filtering and sorting
- **Method**: GET `/api/admin/users` or `/api/admin/stores`
- **Access**: Admin only
- **Query Parameters**: Multiple filter options

#### View User Details
- **Purpose**: Get detailed user information
- **Method**: GET `/api/admin/users/:userId`
- **Access**: Admin only

#### View Store Details
- **Purpose**: Get detailed store information
- **Method**: GET `/api/admin/stores/:storeId`
- **Access**: Admin only

## Validation Rules (Backend)

### Name Validation
- **Required**: Yes
- **Minimum Length**: 20 characters
- **Maximum Length**: 60 characters
- **Pattern**: Alphabets, spaces, hyphens, apostrophes only
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Name must be between 20 and 60 characters and contain only letters, spaces, hyphens, and apostrophes"
  }
  ```

### Address Validation
- **Required**: No (except for stores)
- **Maximum Length**: 400 characters
- **Pattern**: Alphanumeric, spaces, commas, periods, hyphens
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Address cannot exceed 400 characters"
  }
  ```

### Email Format & Uniqueness
- **Required**: Yes
- **Format**: Standard email regex validation
- **Uniqueness**: Check against existing users in database
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Email already exists"
  }
  ```

### Password Rules
- **Required**: Yes
- **Minimum Length**: 8 characters
- **Maximum Length**: 16 characters
- **Requirements**: At least one uppercase letter, one special character
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Password must be 8-16 characters long with at least one uppercase letter and one special character"
  }
  ```

### Rating Values
- **Required**: Yes
- **Valid Values**: 1, 2, 3, 4, 5
- **Database Constraint**: CHECK (rating_value BETWEEN 1 AND 5)
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Rating must be between 1 and 5"
  }
  ```

### Request Validation Middleware
- Use express-validator or similar library
- Validate request body, query parameters, and route parameters
- Sanitize inputs to prevent XSS attacks
- Return detailed error messages for validation failures

### Error Responses Format
```json
{
  "success": false,
  "error": "Error message description",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Error Handling Strategy

### Centralized Error Handling
- **Global Error Handler**: Catch-all middleware for unhandled errors
- **Error Classes**: Custom error classes for different error types
- **Error Logging**: Log errors with context for debugging
- **Error Response Format**: Consistent JSON error responses

### HTTP Status Codes Usage
- **200 OK**: Successful GET, PUT, DELETE requests
- **201 Created**: Successful POST requests
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflicts (duplicate email, etc.)
- **500 Internal Server Error**: Unexpected server errors

### Validation Errors
- **Input Validation**: Validate all incoming data
- **Field-level Errors**: Specific error messages per field
- **Response Format**: Structured error response with details
- **Logging**: Log validation failures for monitoring

### Authentication Errors
- **Invalid Credentials**: Wrong email/password combinations
- **Token Expired**: JWT token has expired
- **Invalid Token**: Malformed or tampered tokens
- **Account Inactive**: User account is deactivated

### Authorization Errors
- **Insufficient Permissions**: User lacks required role
- **Resource Access**: User trying to access unauthorized resources
- **Admin Required**: Operation requires admin privileges

### Database Errors
- **Connection Errors**: Database connection failures
- **Query Errors**: SQL syntax or constraint violations
- **Transaction Errors**: Rollback on transaction failures
- **Deadlock Handling**: Retry logic for deadlock scenarios

## Sorting, Filtering & Pagination

### Query Parameters
- **page**: Page number (default: 1)
- **limit**: Items per page (default: 10, max: 100)
- **sortBy**: Field to sort by
- **sortOrder**: ASC or DESC (default: ASC)
- **search**: Search query string
- **filter**: Filter criteria

### Server-side Sorting
```javascript
// Example sorting implementation
const sortOptions = {
  name: 'name',
  email: 'email',
  createdAt: 'created_at',
  rating: 'rating_value'
};

const sortBy = sortOptions[req.query.sortBy] || 'created_at';
const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';
```

### Filtering by Name, Email, Address, Role
```javascript
// Example filtering implementation
const filters = {};

if (req.query.search) {
  filters[Op.or] = [
    { name: { [Op.like]: `%${req.query.search}%` } },
    { email: { [Op.like]: `%${req.query.search}%` } }
  ];
}

if (req.query.role) {
  filters.role = req.query.role;
}

if (req.query.address) {
  filters.address = { [Op.like]: `%${req.query.address}%` } };
}
```

### Pagination Strategy
- **Offset-based Pagination**: Use LIMIT and OFFSET
- **Cursor-based Pagination**: For large datasets (optional)
- **Metadata**: Include pagination info in response
- **Performance**: Optimize queries with proper indexing

**Response Format**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Backend Folder Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── storeController.js
│   │   ├── ratingController.js
│   │   └── adminController.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── stores.js
│   │   ├── ratings.js
│   │   └── admin.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── storeService.js
│   │   ├── ratingService.js
│   │   └── adminService.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Store.js
│   │   ├── Rating.js
│   │   └── index.js
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── utils/               # Utility functions
│   │   ├── database.js
│   │   ├── jwt.js
│   │   ├── validation.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── app.js
│   ├── validators/          # Input validation schemas
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   └── storeValidator.js
│   ├── tests/               # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── app.js               # Express app setup
│   └── server.js            # Server startup
├── .env                     # Environment variables
├── .env.example            # Environment template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
├── package-lock.json       # Lock file
├── README.md               # This file
└── server.js               # Entry point (alternative)
```

## Environment Configuration

### Environment Variables (.env)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=store_rating_platform
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Database Credentials
- Use environment variables for all database credentials
- Never commit credentials to version control
- Use different credentials for development and production
- Implement database connection pooling

### JWT Secrets
- Use strong, random secrets for JWT tokens
- Separate secrets for access and refresh tokens
- Rotate secrets periodically in production
- Store secrets securely in production environment

### Port Configuration
- Development: Port 3000 (or available port)
- Production: Use environment-provided port
- Implement graceful shutdown handling

## Deployment Notes

### Railway Deployment
**Prerequisites**:
- Railway account
- GitHub repository with backend code
- MySQL database (Railway MySQL plugin)

**Deployment Steps**:
1. Connect GitHub repository to Railway
2. Add MySQL plugin to Railway project
3. Configure environment variables in Railway dashboard
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy and monitor build logs

### MySQL Hosting Options
**Free Tier Options**:
- Railway MySQL Plugin (free tier available)
- PlanetScale (free tier with limitations)
- JawsDB (Heroku add-on)
- ClearDB (free tier available)

**Production Considerations**:
- Connection pooling for performance
- Read replicas for scaling
- Automated backups
- SSL connections for security

### Free Tier Considerations
- **Resource Limits**: Monitor CPU, memory, and database connections
- **Request Limits**: Implement rate limiting to stay within limits
- **Database Limits**: Optimize queries to reduce load
- **Uptime**: Free tiers may have downtime limitations

### Environment Variable Setup on Deployment
```bash
# Railway Environment Variables Example
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=production_secret_key
JWT_REFRESH_SECRET=production_refresh_secret
NODE_ENV=production
```

## Security Best Practices

### Password Hashing
- Use bcrypt with minimum 12 salt rounds
- Never store plain text passwords
- Implement password strength requirements
- Use secure password reset mechanisms

### JWT Expiry
- Access tokens: 15 minutes
- Refresh tokens: 7 days
- Implement token rotation for refresh tokens
- Store refresh tokens securely (httpOnly cookies recommended)

### Input Sanitization
- Sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement XSS protection headers
- Validate and sanitize file uploads

### SQL Injection Prevention
- Use parameterized queries or ORM
- Avoid raw SQL queries with user input
- Implement input validation at multiple layers
- Use database user with limited permissions

### CORS Handling
```javascript
// CORS configuration example
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Additional Security Measures
- Rate limiting to prevent brute force attacks
- Request size limits
- Security headers (helmet.js)
- Regular dependency updates
- Security audit of dependencies

## API Documentation Notes

### Expected Request/Response Structure
**Success Response Format**:
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### Status Codes
- **200**: Successful operation
- **201**: Resource created
- **400**: Bad request/validation error
- **401**: Authentication required
- **403**: Insufficient permissions
- **404**: Resource not found
- **409**: Resource conflict
- **500**: Internal server error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Invalid input data",
    "fields": [
      {
        "name": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/auth/login"
}
```

### API Versioning
- Use URL path versioning: `/api/v1/`
- Maintain backward compatibility when possible
- Document version changes and deprecations
- Implement version negotiation for clients

**Versioned Route Example**:
```javascript
// v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stores', storeRoutes);

// v2 routes (future)
app.use('/api/v2/auth', authRoutesV2);
```
