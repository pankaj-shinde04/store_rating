import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const RatingManagement = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch ratings
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search,
        rating: ratingFilter,
        store: storeFilter,
        user: userFilter,
        status: statusFilter,
        dateFrom,
        dateTo
      });
      
      const response = await fetch(`http://localhost:3001/api/admin/ratings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRatings(data.data.ratings);
        setTotalPages(data.data.pagination.pages);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch ratings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete rating
  const deleteRating = async (ratingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3001/api/admin/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowDeleteModal(false);
        setSelectedRating(null);
        fetchRatings(); // Refresh ratings list
      } else {
        setError(data.error || 'Failed to delete rating');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error deleting rating:', err);
    }
  };

  // Approve rating
  const approveRating = async (ratingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3001/api/admin/ratings/${ratingId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowApproveModal(false);
        setSelectedRating(null);
        fetchRatings(); // Refresh ratings list
      } else {
        setError(data.error || 'Failed to approve rating');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error approving rating:', err);
    }
  };

  // Reject rating
  const rejectRating = async (ratingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3001/api/admin/ratings/${ratingId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowRejectModal(false);
        setSelectedRating(null);
        setRejectionReason('');
        fetchRatings(); // Refresh ratings list
      } else {
        setError(data.error || 'Failed to reject rating');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error rejecting rating:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'search':
        setSearch(value);
        break;
      case 'ratingFilter':
        setRatingFilter(value);
        break;
      case 'statusFilter':
        setStatusFilter(value);
        break;
      case 'storeFilter':
        setStoreFilter(value);
        break;
      case 'userFilter':
        setUserFilter(value);
        break;
      case 'dateFrom':
        setDateFrom(value);
        break;
      case 'dateTo':
        setDateTo(value);
        break;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setRatingFilter('');
    setStatusFilter('all');
    setStoreFilter('');
    setUserFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>);
      }
    }
    
    return stars;
  };

  useEffect(() => {
    fetchRatings();
  }, [currentPage, search, ratingFilter, storeFilter, userFilter, statusFilter, dateFrom, dateTo]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rating Management</h1>
        <p className="text-gray-600">Manage and moderate all user ratings</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={search}
              onChange={handleInputChange}
              placeholder="Search by user, store, or comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              name="ratingFilter"
              value={ratingFilter}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="statusFilter"
              value={statusFilter}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <input
              type="text"
              name="storeFilter"
              value={storeFilter}
              onChange={handleInputChange}
              placeholder="Filter by store name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              name="userFilter"
              value={userFilter}
              onChange={handleInputChange}
              placeholder="Filter by user name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={dateFrom}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              name="dateTo"
              value={dateTo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => fetchRatings()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ratings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No ratings found
                    </td>
                  </tr>
                ) : (
                  ratings.map((rating) => (
                    <tr key={rating.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderStars(rating.rating_value)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {rating.rating_value}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rating.user_name}</div>
                          <div className="text-sm text-gray-500">{rating.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rating.store_name}</div>
                          <div className="text-sm text-gray-500">{rating.store_address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rating.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : rating.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rating.status || 'approved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {rating.rating_value}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {rating.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRating(rating);
                                  setShowApproveModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRating(rating);
                                  setShowRejectModal(true);
                                }}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRating(rating);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && ratings.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRating && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2" id="modal-headline">
                  Delete Rating
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this rating from{' '}
                    <span className="font-semibold">{selectedRating.user_name}</span> for{' '}
                    <span className="font-semibold">{selectedRating.store_name}</span>?
                  </p>
                  <div className="mt-2 p-3 bg-gray-100 rounded">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Rating:</span>
                      <div className="flex items-center ml-2">
                        {renderStars(selectedRating.rating_value)}
                        <span className="ml-2 text-sm font-bold text-gray-900">
                          {selectedRating.rating_value}/5
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>User:</strong> {selectedRating.user_name} ({selectedRating.user_email})</p>
                      <p><strong>Store:</strong> {selectedRating.store_name}</p>
                      <p><strong>Date:</strong> {new Date(selectedRating.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteRating(selectedRating.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedRating && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2" id="modal-headline">
                  Approve Rating
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to approve this rating from{' '}
                    <span className="font-semibold">{selectedRating.user_name}</span> for{' '}
                    <span className="font-semibold">{selectedRating.store_name}</span>?
                  </p>
                  <div className="mt-2 p-3 bg-gray-100 rounded">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Rating:</span>
                      <div className="flex items-center ml-2">
                        {renderStars(selectedRating.rating_value)}
                        <span className="ml-2 text-sm font-bold text-gray-900">
                          {selectedRating.rating_value}/5
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>User:</strong> {selectedRating.user_name} ({selectedRating.user_email})</p>
                      <p><strong>Store:</strong> {selectedRating.store_name}</p>
                      <p><strong>Date:</strong> {new Date(selectedRating.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => approveRating(selectedRating.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedRating && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2" id="modal-headline">
                  Reject Rating
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to reject this rating from{' '}
                    <span className="font-semibold">{selectedRating.user_name}</span> for{' '}
                    <span className="font-semibold">{selectedRating.store_name}</span>?
                  </p>
                  <div className="mt-2 p-3 bg-gray-100 rounded">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Rating:</span>
                      <div className="flex items-center ml-2">
                        {renderStars(selectedRating.rating_value)}
                        <span className="ml-2 text-sm font-bold text-gray-900">
                          {selectedRating.rating_value}/5
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>User:</strong> {selectedRating.user_name} ({selectedRating.user_email})</p>
                      <p><strong>Store:</strong> {selectedRating.store_name}</p>
                      <p><strong>Date:</strong> {new Date(selectedRating.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => rejectRating(selectedRating.id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Reject Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default RatingManagement;
