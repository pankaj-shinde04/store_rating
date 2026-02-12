import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import RatingManagement from './RatingManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
    activeUsers: 0,
    pendingStores: 0
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchDashboardData();
    // Initialize profile data with current user info
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:3001/api/admin/users?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

      // Fetch recent stores
      const storesResponse = await fetch('http://localhost:3001/api/admin/stores?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (storesResponse.ok) {
        const storesData = await storesResponse.json();
        setStores(storesData.data || []);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    logout();
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Profile updated successfully!');
        setShowUpdateProfileModal(false);
        // Update user in context and localStorage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // You might need to update the auth context here
      } else {
        const error = await response.json();
        alert('Failed to update profile: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Password changed successfully!');
        setShowChangePasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        alert('Failed to change password: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🛡️ Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span>Admin: {user?.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowUpdateProfileModal(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📝 Update Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🔒 Change Password
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'users', label: '👥 Users', icon: '👥' },
                { id: 'stores', label: '🏪 Stores', icon: '🏪' },
                { id: 'ratings', label: '⭐ Ratings', icon: '⭐' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">🏪</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total Stores</h3>
                      <p className="text-2xl font-bold text-green-600">{stats.totalStores}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total Ratings</h3>
                      <p className="text-2xl font-bold text-yellow-600">{stats.totalRatings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">📊</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                      <p className="text-2xl font-bold text-purple-600">{(typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between py-2 border-b">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent users</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Stores</h3>
                  <div className="space-y-3">
                    {stores.length > 0 ? (
                      stores.map((store) => (
                        <div key={store.id} className="flex items-center justify-between py-2 border-b">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{store.name}</p>
                            <p className="text-xs text-gray-500">{store.address}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            store.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {store.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent stores</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'stores' && (
            <StoreManagement />
          )}

          {activeTab === 'ratings' && (
            <RatingManagement />
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <p className="text-gray-600">System settings interface coming soon...</p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">User Registration</span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Configure</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Data Backup</span>
                      <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">Schedule</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Update Profile Modal */}
      {showUpdateProfileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateProfileModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
