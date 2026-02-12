/**
 * User Module Index
 * Central export point for all user-related modules
 */

// Profile Management
const { updateUserProfile } = require('./userProfile');

// Statistics & Analytics
const { getUserStats, getUserRatings } = require('./userStats');

// Authentication
const { changeUserPassword } = require('./userAuth');

// Favorites Management
const { addToFavorites, removeFromFavorites, getUserFavorites } = require('./userFavorites');

module.exports = {
  // Profile Management
  updateUserProfile,
  
  // Statistics & Analytics
  getUserStats,
  getUserRatings,
  
  // Authentication
  changeUserPassword,
  
  // Favorites Management
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
};
