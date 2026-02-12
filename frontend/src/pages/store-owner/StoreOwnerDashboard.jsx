import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StoreOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Debug current user session
  console.log('=== AUTH DEBUG ===');
  console.log('Current Auth User:', user);
  console.log('User ID:', user?.id);
  console.log('User Email:', user?.email);
  console.log('User Role:', user?.role);
  console.log('==================');
  
  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        );
      }
    }
    return stars;
  };
  const [stats, setStats] = useState({
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
    totalCustomers: 0,
    pendingReviews: 0
  });
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [storeRatings, setStoreRatings] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    category: ''
  });
  const [profileData, setProfileData] = useState({
    name: user?.name,
    email: user?.email,
    address: user?.address
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Add handleEditStore function that was missing
  const handleEditStore = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      description: store.description || '',
      phone: store.phone || '',
      email: store.email || '',
      website: store.website || '',
      category: store.category || ''
    });
    setPhotoPreview(store.photo_url || null);
    setShowAddStore(true);
  };

  const fetchStoreRatings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return;
      }
      
      // Fetch ratings for all stores owned by this store owner
      const ratingsPromises = stores.map(async (store) => {
        try {
          const response = await fetch(`http://localhost:3001/api/ratings/store/${store.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const ratingsData = await response.json();
            return {
              storeId: store.id,
              storeName: store.name,
              ratings: ratingsData.data || []
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ratings for store ${store.id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(ratingsPromises);
      const allRatings = results.filter(result => result !== null).flatMap(result => 
        result.ratings.map(rating => ({
          ...rating,
          store_name: result.storeName,
          store_id: result.storeId
        }))
      );
      
      setStoreRatings(allRatings);
    } catch (error) {
      console.error('Error fetching store ratings:', error);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        // console.error('No authentication token found');
        return;
      }
      
      // console.log('🔍 Fetching dashboard data...');
      
      // Fetch dashboard statistics
      try {
        const statsResponse = await fetch('http://localhost:3001/api/stores/owner/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Stats data received:', statsData.data); // Debug log
          setStats(statsData.data || stats);
          console.log('✅ Stats fetched successfully');
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
          // console.error('❌ Stats fetch failed:', statsResponse.status);
        }
      } catch (error) {
        // console.error('❌ Stats fetch error:', error);
      }

      // Fetch owner's stores
      try {
        const storesResponse = await fetch('http://localhost:3001/api/stores/owner', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          setStores(storesData.data || []);
          // console.log('✅ Stores fetched successfully');
          
          // Fetch ratings after stores are loaded
          await fetchStoreRatings();
        } else {
          const errorData = await storesResponse.json();
          if (errorData.error === 'Token expired') {
            alert('Your session has expired. Please login again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          // console.error('❌ Stores fetch failed:', storesResponse.status);
        }
      } catch (error) {
        // console.error('❌ Stores fetch error:', error);
      }

      // Fetch customers
      try {
        const customersResponse = await fetch('http://localhost:3001/api/stores/owner/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (customersResponse.ok) {
          const data = await customersResponse.json();
          console.log('Customers data received:', data.data); // Debug log
          setCustomers(data.data || []);
          console.log('✅ Customers fetched successfully');
        } else {
          const errorData = await customersResponse.json();
          if (errorData.error === 'Token expired') {
            alert('Your session has expired. Please login again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          // console.error('❌ Customers fetch failed:', customersResponse.status);
        }
      } catch (error) {
        // console.error('Failed to fetch customers:', error);
      }
    } catch (error) {
      // console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Added dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Add fetchDashboardData dependency

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    logout();
  };

  // Profile Management Functions
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

      if (response.ok) {
        alert('Profile updated successfully!');
        setShowProfileEdit(false);
        // Update user in context
        const updatedUser = { ...user, ...profileData };
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
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
      
      // console.log('🔍 Attempting password change...');
      // console.log('🔍 Password data:', {
      //   currentPassword: passwordData.currentPassword ? '***' : 'empty',
      //   newPassword: passwordData.newPassword ? '***' : 'empty',
      //   confirmPassword: passwordData.confirmPassword ? '***' : 'empty'
      // });
      
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

      // console.log('🔍 Password change response status:', response.status);
      // console.log('🔍 Password change response headers:', response.headers);

      const responseData = await response.json();
      // console.log('🔍 Password change response data:', responseData);

      if (response.ok) {
        alert('Password changed successfully!');
        setShowPasswordChange(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        // console.error('❌ Password change failed:', responseData);
        
        // Handle token expiration
        if (responseData.error === 'Token expired') {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        alert(responseData.error || 'Failed to change password');
      }
    } catch (error) {
      // console.error('❌ Password change error:', error);
      alert('Failed to change password');
    }
  };

  // Customer Management Functions
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:3001/api/stores/owner/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Customers data received:', data.data); // Debug log
        setCustomers(data.data || []);
        console.log('✅ Customers fetched successfully');
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Store file for upload
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // console.log('🔍 Submitting store form...');
    // console.log('🔍 Editing store:', editingStore);
    // console.log('🔍 Form data:', formData);
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'photo' || formData[key]) {
        formDataToSend.append(key, formData[key]);
        // console.log(`🔍 Adding to FormData: ${key} = ${formData[key]}`);
      }
    });

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        // console.error('No authentication token found for store creation');
        alert('Please login again to create a store');
        return;
      }
      
      // Debug: Check user role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔍 Current user role:', user.role);
      console.log('🔍 Current user data:', user);
      
      const url = editingStore 
        ? `http://localhost:3001/api/stores/${editingStore.id}`
        : 'http://localhost:3001/api/stores';
      
      console.log('🔍 Store update URL:', url);
      console.log('🔍 Store update method:', editingStore ? 'PUT' : 'POST');
      
      const response = await fetch(url, {
        method: editingStore ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      // console.log('🔍 Store update response status:', response.status);
      // console.log('🔍 Store update response headers:', response.headers);

      const responseData = await response.json();
      // console.log('🔍 Store update response data:', responseData);
      
      // Log the full response data object
      // console.log('🔍 Response details:', {
      //   success: responseData.success,
      //   error: responseData.error,
      //   message: responseData.message,
      //   data: responseData.data
      // });

      if (response.ok) {
        alert(editingStore ? 'Store updated successfully!' : 'Store created successfully!');
        setShowAddStore(false);
        setEditingStore(null);
        setPhotoPreview(null);
        setFormData({
          name: '',
          address: '',
          description: '',
          phone: '',
          email: '',
          website: '',
          category: ''
        });
        fetchDashboardData();
      } else {
        alert(responseData.error || 'Failed to save store');
      }
    } catch (error) {
      // console.error('Error saving store:', error);
      alert('Failed to save store');
    }
  };

  // Debug logging
  console.log('=== STORE OWNER DASHBOARD DEBUG ===');
  console.log('Active Tab:', activeTab);
  console.log('Customers Data:', customers);
  console.log('Customers Length:', customers.length);
  console.log('Stats Data:', stats);
  console.log('================================');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading store owner dashboard...</p>
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
                🏪 Store Owner Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Owner: {user?.name}
              </span>
              <button
                onClick={() => setShowAddStore(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
              >
                + Add Store
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
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
                { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                { id: 'stores', label: '🏪 My Stores', icon: '🏪' },
                { id: 'ratings', label: '⭐ Reviews', icon: '⭐' },
                { id: 'customers', label: '👥 Customers', icon: '👥' },
                { id: 'analytics', label: '📈 Analytics', icon: '📈' },
                { id: 'profile', label: '👤 Profile', icon: '👤' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-100 text-green-700'
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
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h2>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">🏪</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total Stores</h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalStores}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total Reviews</h3>
                      <p className="text-2xl font-bold text-green-600">{stats.totalRatings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">📊</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                      <p className="text-2xl font-bold text-yellow-600">{(typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Customers</h3>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">💬</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Pending Reviews</h3>
                      <p className="text-2xl font-bold text-red-600">{stats.pendingReviews}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium">
                    View All Stores
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium">
                    Customer Reviews
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium">
                    Business Reports
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Stores</h2>
                <button
                  onClick={() => setShowAddStore(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Add New Store
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <div key={store.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center mb-4">
                        {store.photo_url ? (
                          <img 
                            src={`http://localhost:3001${store.photo_url}`} 
                            alt={store.name}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">🏪</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                          <p className="text-sm text-gray-600">{store.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{store.address}</p>
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {renderStars(Math.round(store.average_rating || 0))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {(typeof store.average_rating === 'number' ? store.average_rating.toFixed(1) : '0.0')} ({store.rating_count || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          store.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {store.is_verified && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditStore(store)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                        >
                          Edit
                        </button>
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm">
                          View Reviews
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No stores added yet.</p>
                    <button
                      onClick={() => setShowAddStore(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium mt-4"
                    >
                      Add Your First Store
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  {storeRatings.length > 0 ? (
                    <div className="space-y-4">
                      {storeRatings.map((rating) => (
                        <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {rating.store_name}
                                </h4>
                                <div className="ml-4 flex items-center">
                                  {renderStars(rating.rating_value)}
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({(typeof rating.rating_value === 'number' ? rating.rating_value.toFixed(1) : '0.0')})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <span className="font-medium">By:</span>
                                <span className="ml-2">{rating.user_name}</span>
                                <span className="ml-2 text-gray-500">({rating.user_email})</span>
                              </div>
                              {rating.review_text && (
                                <p className="text-gray-700 mb-2">
                                  "{rating.review_text}"
                                </p>
                              )}
                              <div className="text-xs text-gray-500">
                                Rated on {new Date(rating.created_at).toLocaleDateString()} at {new Date(rating.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">⭐</span>
                      </div>
                      <p className="text-gray-600 mb-4">No customer reviews yet</p>
                      <p className="text-sm text-gray-500">
                        When customers rate your stores, their reviews will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Analytics</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <p className="text-gray-600 mb-4">Analytics dashboard coming soon...</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Rating Trends</h3>
                      <p className="text-sm text-gray-600">View your store rating trends over time</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Insights</h3>
                      <p className="text-sm text-gray-600">Demographics and behavior analysis</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Analysis</h3>
                      <p className="text-sm text-gray-600">Track performance metrics</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Competitor Analysis</h3>
                      <p className="text-sm text-gray-600">Compare with local competitors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  {customers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reviews</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customers.map((customer) => (
                            <tr key={customer.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {customer.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {customer.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {customer.total_reviews || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  {renderStars(Math.round(customer.average_rating || 0))}
                                  <span className="ml-2">{(typeof customer.average_rating === 'number' ? customer.average_rating.toFixed(1) : '0.0')}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No customers found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Profile</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Address</label>
                      <textarea
                        rows={3}
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter your business address"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button 
                        onClick={handleProfileUpdate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Update Profile
                      </button>
                      <button 
                        onClick={() => setShowPasswordChange(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border sm:my-10 sm:p-0 max-w-md sm:w-full">
            <div className="relative bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={handlePasswordChange}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={() => setShowPasswordChange(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* Add Store Modal */}
      {showAddStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border sm:my-10 sm:p-0 max-w-lg sm:w-full">
            <div className="relative bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingStore ? 'Edit Store' : 'Add New Store'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddStore(false);
                    setEditingStore(null);
                    setPhotoPreview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Describe your store..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="store@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://www.example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Coffee Shop">Coffee Shop</option>
                    <option value="Retail">Retail</option>
                    <option value="Service">Service</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Photo</label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
                
                {photoPreview && (
                  <div className="mt-2">
                    <img 
                      src={photoPreview} 
                      alt="Store preview" 
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStore(false);
                      setEditingStore(null);
                      setPhotoPreview(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingStore ? 'Update Store' : 'Add Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
