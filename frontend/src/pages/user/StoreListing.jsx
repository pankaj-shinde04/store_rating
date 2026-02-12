import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authenticatedFetch } from '../../utils/authUtils';

const StoreListing = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        minRating: filterRating,
        sortBy: sortBy
      });

      const response = await fetch(`http://localhost:3001/api/stores?${params}`);
      const data = await response.json();

      if (data.success) {
        setStores(data.data.stores || []);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRating, sortBy, currentPage]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (rating) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setShowRateModal(true);
  };

  const submitRating = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:3001/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          store_id: selectedStore.id,
          rating_value: userRating,
          review_text: userReview
        })
      });

      if (response.ok) {
        setShowRateModal(false);
        setUserRating(5);
        setUserReview('');
        fetchStores();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
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

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">🏪 Store Directory</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search by store name or address..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterRating}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="created_at">Sort by Newest</option>
                  <option value="rating_count">Sort by Most Reviews</option>
                </select>
              </div>
            </div>
          </div>

          {stores.length === 0 && !loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                    <div className="flex items-center mb-2">
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
                  <p className="text-sm text-gray-600 mb-3">
                    {store.address.length > 50 ? `${store.address.substring(0, 50)}...` : store.address}
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.location.href = `/stores/${store.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRateStore(store)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Rate Store
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Rating Modal */}
      {showRateModal && selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border sm:my-10 sm:p-0 max-w-lg sm:w-full">
            <div className="relative bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Rate {selectedStore.name}</h3>
                <button
                  onClick={() => setShowRateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className={`text-3xl ${
                          star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
                  <textarea
                    rows={4}
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Share your experience with this store..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRating}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreListing;