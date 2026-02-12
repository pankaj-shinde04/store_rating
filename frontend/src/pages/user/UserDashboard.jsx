import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    ratedStores: 0,
    favoriteStores: 0
  });
  const [userRatings, setUserRatings] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const fetchAllStores = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/stores/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const storesData = await response.json();
        setAllStores(storesData.data || []);
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Token expired') {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
      }
    } catch (error) {
      // console.error('Failed to fetch stores:', error);
    }
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        navigate('/login');
        return;
      }

      setUser(userData);
      setProfileData({
        name: userData.name || '',
        address: userData.address || '',
        phone: userData.phone || '',
        email: userData.email || ''
      });

      // Fetch user stats
      try {
        const statsResponse = await fetch('http://localhost:3001/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || {
            totalRatings: 0,
            averageRating: 0,
            ratedStores: 0,
            favoriteStores: 0
          });
        } else {
          const errorData = await statsResponse.json();
          if (errorData.error === 'Token expired') {
            alert('Your session has expired. Please login again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        }
      } catch (error) {
        // console.error('Stats fetch error:', error);
      }

      // Fetch user ratings
      try {
        const ratingsResponse = await fetch('http://localhost:3001/api/users/ratings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json'
          }
        });

        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setUserRatings(ratingsData.data || []);
        } else {
          const errorData = await ratingsResponse.json();
          if (errorData.error === 'Token expired') {
            alert('Your session has expired. Please login again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        }
      } catch (error) {
        // console.error('Ratings fetch error:', error);
      }

    } catch (error) {
      // console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        setShowProfileEdit(false);
        // Update localStorage user data
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        if (responseData.error === 'Token expired') {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        alert(responseData.error || 'Failed to update profile');
      }
    } catch (error) {
      // console.error('Profile update error:', error);
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
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

      const responseData = await response.json();

      if (response.ok) {
        alert('Password changed successfully!');
        setShowPasswordChange(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        if (responseData.error === 'Token expired') {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        alert(responseData.error || 'Failed to change password');
      }
    } catch (error) {
      // console.error('Password change error:', error);
      alert('Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRateStore = (store) => {
    // Navigate to store details page with rating capability
    navigate(`/store/${store.id}?rate=true`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    
    return stars;
  };

  // Fetch user data and ratings
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch stores separately
  useEffect(() => {
    fetchAllStores();
  }, [fetchAllStores]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Dashboard</h2>
          
          {/* User Profile Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">{user?.name || 'User'}</h3>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Ratings</span>
                <span className="font-medium">{stats.totalRatings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-medium">{(typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rated Stores</span>
                <span className="font-medium">{stats.ratedStores}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Favorites</span>
                <span className="font-medium">{stats.favoriteStores}</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('stores')}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stores'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏪 All Stores
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ratings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⭐ My Ratings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              👤 Profile & Settings
            </button>
          </nav>
          
          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'stores' && 'All Stores'}
                {activeTab === 'ratings' && 'My Ratings'}
                {activeTab === 'profile' && 'Profile & Settings'}
              </h1>
              <button
                onClick={() => navigate('/stores')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Stores
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⭐</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Ratings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalRatings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Rating
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🏪</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Rated Stores
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.ratedStores}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">❤️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Favorite Stores
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.favoriteStores}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg">
            {/* Stores Tab */}
            {activeTab === 'stores' && (
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  All Stores
                </h3>
                <div className="overflow-hidden">
                  {allStores.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {allStores.map((store) => (
                        <li key={store.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {store.name}
                                </h4>
                                <div className="ml-2 flex items-center">
                                  {renderStars(store.average_rating || 0)}
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({(typeof store.average_rating === 'number' ? store.average_rating.toFixed(1) : '0.0')})
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {store.address}
                              </p>
                              <p className="mt-1 text-sm text-gray-600">
                                {store.category || 'No category'}
                              </p>
                              <p className="mt-2 text-xs text-gray-500">
                                Added on {new Date(store.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/store/${store.id}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleRateStore(store)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                              >
                                Rate Store
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No stores available.</p>
                      <button
                        onClick={() => navigate('/stores')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Browse Stores
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Store Ratings
                </h3>
                <div className="overflow-hidden">
                  {userRatings.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {userRatings.map((rating) => (
                        <li key={rating.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {rating.store_name}
                                </h4>
                                <div className="ml-2 flex items-center">
                                  {renderStars(rating.rating_value)}
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({(typeof rating.rating_value === 'number' ? rating.rating_value.toFixed(1) : '0.0')})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-500">
                                  Store Average: 
                                </span>
                                <div className="ml-1 flex items-center">
                                  {renderStars(Math.round(rating.store_average_rating || 0))}
                                  <span className="ml-1 text-xs text-gray-600">
                                    ({(typeof rating.store_average_rating === 'number' ? rating.store_average_rating.toFixed(1) : '0.0')} {rating.store_rating_count || 0} reviews)
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {rating.store_address}
                              </p>
                              {rating.review_text && (
                                <p className="mt-2 text-sm text-gray-700 italic">
                                  "{rating.review_text}"
                                </p>
                              )}
                              <p className="mt-2 text-xs text-gray-500">
                                Rated on {new Date(rating.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">You haven't rated any stores yet.</p>
                      <button
                        onClick={() => setActiveTab('stores')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Browse Stores to Rate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Profile Information Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-lg">👤</span>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-base font-medium text-gray-900">Profile Information</h4>
                            <p className="text-sm text-gray-500">Update your personal details</p>
                          </div>
                        </div>
                        
                        {!showProfileEdit ? (
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-medium">
                                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">{profileData.name}</h3>
                                <p className="text-sm text-gray-500">{profileData.email}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">Address:</span>
                                <span className="text-sm text-gray-900">{profileData.address || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">Phone:</span>
                                <span className="text-sm text-gray-900">{profileData.phone || 'Not provided'}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setShowProfileEdit(true)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Edit Profile
                            </button>
                          </div>
                        ) : (
                          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }}>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                              <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your name"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                              <textarea
                                value={profileData.address}
                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                rows={3}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your address"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                              <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your phone number"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowProfileEdit(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>

                    {/* Security Settings Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-lg">🔒</span>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-base font-medium text-gray-900">Security Settings</h4>
                            <p className="text-sm text-gray-500">Manage your password</p>
                          </div>
                        </div>
                        
                        {!showPasswordChange ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-gray-400 text-2xl">🔐</span>
                            </div>
                            <p className="text-gray-600 mb-4">Your password is currently secured</p>
                            <button
                              onClick={() => setShowPasswordChange(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Change Password
                            </button>
                          </div>
                        ) : (
                          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }}>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                              <div className="relative">
                                <input
                                  type="password"
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Enter your current password"
                                  required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                  <span className="text-gray-400 text-sm">🔑</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                              <div className="relative">
                                <input
                                  type="password"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Enter your new password"
                                  required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                  <span className="text-gray-400 text-sm">🔒</span>
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">
                                Password must be at least 8 characters long
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                              <div className="relative">
                                <input
                                  type="password"
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Confirm your new password"
                                  required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                  <span className="text-gray-400 text-sm">✓</span>
                                </div>
                              </div>
                              {passwordData.newPassword && passwordData.confirmPassword && (
                                <p className={`mt-2 text-xs ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                  {passwordData.newPassword === passwordData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex space-x-3">
                              <button
                                type="submit"
                                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                Update Password
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPasswordChange(false);
                                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Ratings Card */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <span className="text-yellow-600 text-lg">⭐</span>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-base font-medium text-gray-900">Recent Ratings</h4>
                          <p className="text-sm text-gray-500">Your latest store ratings</p>
                        </div>
                      </div>
                      
                      {stats.recentRatings && stats.recentRatings.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentRatings.map((rating) => (
                            <div key={rating.id} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-900">{rating.store_name}</h5>
                                <div className="flex items-center">
                                  {renderStars(rating.rating_value)}
                                  <span className="ml-2 text-xs text-gray-600">
                                    ({(typeof rating.rating_value === 'number' ? rating.rating_value.toFixed(1) : '0.0')})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-500">Store Avg:</span>
                                <div className="ml-1 flex items-center">
                                  {renderStars(Math.round(rating.store_average_rating || 0))}
                                  <span className="ml-1 text-xs text-gray-600">
                                    ({(typeof rating.store_average_rating === 'number' ? rating.store_average_rating.toFixed(1) : '0.0')} {rating.store_rating_count || 0})
                                  </span>
                                </div>
                              </div>
                              {rating.review_text && (
                                <p className="mt-1 text-xs text-gray-600 italic">
                                  "{rating.review_text}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-2xl">⭐</span>
                          </div>
                          <p className="text-gray-600">No ratings yet</p>
                          <button
                            onClick={() => window.location.href = '/stores'}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Browse Stores
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Security Tips */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-blue-600 text-lg">💡</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-900">Security Tips</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Use a strong password with letters, numbers, and symbols</li>
                          <li>• Don't reuse passwords from other accounts</li>
                          <li>• Change your password regularly</li>
                          <li>• Never share your password with anyone</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
