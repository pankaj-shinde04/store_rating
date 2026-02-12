/**
 * Token refresh utility
 */

/**
 * Check if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse, assume expired
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('http://localhost:3001/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update tokens in localStorage
    localStorage.setItem('accessToken', data.data.accessToken);
    if (data.data.refreshToken) {
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }

    return data.data.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Redirect to current page instead of login to let user re-authenticate
    window.location.href = window.location.pathname;
    throw error;
  }
};

/**
 * Make authenticated API call with automatic token refresh
 */
const authenticatedFetch = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');
  
  // Check if token is expired and refresh if needed
  if (token && isTokenExpired(token)) {
    try {
      token = await refreshToken();
    } catch (error) {
      throw error; // Will redirect to login
    }
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Make the API call
  const response = await fetch(url, {
    ...options,
    headers
  });

  // If we get 401, try to refresh and retry once
  if (response.status === 401) {
    try {
      token = await refreshToken();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return retryResponse;
    } catch (error) {
      throw error; // Will redirect to login
    }
  }

  return response;
};

module.exports = {
  isTokenExpired,
  refreshToken,
  authenticatedFetch
};
