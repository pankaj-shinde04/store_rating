/**
 * Authentication validation schemas
 */

/**
 * Validate user registration data
 */
const validateRegistration = (data) => {
  const errors = [];

  // Name validation
  if (!data.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string' });
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (data.name.length > 60) {
    errors.push({ field: 'name', message: 'Name cannot exceed 60 characters' });
  } else if (!/^[a-zA-Z\s\-']+$/.test(data.name)) {
    errors.push({ field: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });
  }

  // Email validation
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password must be a string' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  } else if (data.password.length > 50) {
    errors.push({ field: 'password', message: 'Password cannot exceed 50 characters' });
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  // Role validation
  if (!data.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!['normal_user', 'store_owner', 'admin'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Invalid role. Must be normal_user, store_owner, or admin' });
  }

  // Address validation (optional for normal users, required for store owners)
  if (data.role === 'store_owner' && !data.address) {
    errors.push({ field: 'address', message: 'Address is required for store owners' });
  } else if (data.address && typeof data.address === 'string') {
    if (data.address.length > 400) {
      errors.push({ field: 'address', message: 'Address cannot exceed 400 characters' });
    }
  }

  return errors;
};

/**
 * Validate user login data
 */
const validateLogin = (data) => {
  const errors = [];

  // Email validation
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password must be a string' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  } else if (data.password.length > 50) {
    errors.push({ field: 'password', message: 'Password cannot exceed 50 characters' });
  }

  // Role validation
  if (!data.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!['normal_user', 'store_owner', 'admin'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Invalid role. Must be normal_user, store_owner, or admin' });
  }

  return errors;
};

/**
 * Validate change password data
 */
const validateChangePassword = (data) => {
  const errors = [];

  // Current password validation
  if (!data.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  // New password validation
  if (!data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else if (typeof data.newPassword !== 'string') {
    errors.push({ field: 'newPassword', message: 'New password must be a string' });
  } else if (data.newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters' });
  }

  // Confirm new password validation
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your new password' });
  } else if (data.newPassword !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'New passwords do not match' });
  }

  return errors;
};

/**
 * Validate refresh token data
 */
const validateRefreshToken = (data) => {
  const errors = [];

  if (!data.refreshToken) {
    errors.push({ field: 'refreshToken', message: 'Refresh token is required' });
  } else if (typeof data.refreshToken !== 'string') {
    errors.push({ field: 'refreshToken', message: 'Refresh token must be a string' });
  }

  return errors;
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateChangePassword,
  validateRefreshToken
};
