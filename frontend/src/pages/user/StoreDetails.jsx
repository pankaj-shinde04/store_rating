import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/stores/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setStore(data.data);
      } else {
        console.error('Failed to fetch store details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching store details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/stores')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            Browse Stores
          </button>
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
              <button
                onClick={() => navigate('/stores')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Stores
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Store Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Store Image */}
            <div className="md:w-1/3">
              {store.photo_url ? (
                <img
                  src={`http://localhost:3001${store.photo_url}`}
                  alt={store.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">🏪</span>
                </div>
              )}
            </div>

            {/* Store Information */}
            <div className="md:w-2/3 p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
                <div className="flex items-center mb-4">
                  {renderStars(Math.round(store.average_rating || 0))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({(typeof store.average_rating === 'number' ? store.average_rating.toFixed(1) : '0.0')} {store.rating_count || 0} reviews)
                  </span>
                </div>
                {store.category && (
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 mb-2">
                    {store.category}
                  </span>
                )}
                {store.is_verified && (
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 mb-2 ml-2">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">📍 Address</h3>
                  <p className="text-gray-600">{store.address}</p>
                </div>

                {store.phone && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">📞 Phone</h3>
                    <p className="text-gray-600">{store.phone}</p>
                  </div>
                )}

                {store.email && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">📧 Email</h3>
                    <p className="text-gray-600">{store.email}</p>
                  </div>
                )}

                {store.website && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">🌐 Website</h3>
                    <a 
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {store.website}
                    </a>
                  </div>
                )}

                {store.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">📝 Description</h3>
                    <p className="text-gray-600">{store.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;
