# 🧪 Backend Test Files

This directory contains test scripts for testing the backend API endpoints. These files were moved from the root directory to keep the project structure clean.

## 📋 Test Files Overview

### 🔐 **Authentication Tests**
- **`test-auth-ratings.js`** - Tests admin authentication and rating management endpoints
- **`test-known-users-login.js`** - Tests login functionality with known user credentials
- **`test-login.js`** - Basic login functionality test
- **`test-profile-password.js`** - Tests profile update and password change endpoints

### 📝 **Registration Tests**
- **`test-register-user.js`** - Tests user registration with automatic cleanup
- **`test-registration-test-mode.js`** - Tests registration in test mode (no database persistence)
- **`test-registration-validation.js`** - Tests registration validation without saving

### 👥 **User Management Tests**
- **`test-user-controllers.js`** - Comprehensive test of user registration and login controllers
- **`test-user-ratings.js`** - Tests user rating functionality

### 🏪 **Rating System Tests**
- **`test-ratings.js`** - Basic rating functionality tests

### 👑 **Admin Tests**
- **`create-test-admin.js`** - Creates a test admin user with known credentials

## 🚀 **How to Use**

### **Run Individual Tests:**
```bash
cd backend
node test-files/test-auth-ratings.js
node test-files/test-known-users-login.js
```

### **Test Mode Registration:**
```bash
node test-files/test-registration-test-mode.js
```

### **Create Test Admin:**
```bash
node test-files/create-test-admin.js
```

## 🔧 **Test Credentials**

The tests create and use the following known credentials:

### **Admin User:**
- Email: `testadmin@example.com`
- Password: `Admin123456`
- Role: `admin`

### **Normal User:**
- Email: `normaluser1770886225438@example.com`
- Password: `NormalUser123`
- Role: `normal_user`

### **Store Owner:**
- Email: `storeowner1770886226691@example.com`
- Password: `StoreOwner123`
- Role: `store_owner`

## 📝 **Important Notes**

- These files are for development and testing only
- They are excluded from version control by the `.gitignore` file
- Some tests create temporary users in the database
- Test mode registration doesn't persist data to database
- Make sure the backend server is running on `localhost:3001` before running tests

## 🛡️ **Security**

- All test files use hardcoded credentials for testing only
- No production credentials are stored in these files
- Test mode prevents database persistence when needed
- Temporary users are created with known passwords for easy testing

## 🔄 **Cleanup**

Some test files include automatic cleanup of test users. Others create persistent test users that can be used for frontend testing. Check individual files for cleanup behavior.
