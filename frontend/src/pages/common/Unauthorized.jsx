import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const redirectPath = getRedirectPath();
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            You don't have permission to access this page.
          </p>
          
          {user && (
            <p className="text-sm text-gray-500 mb-8">
              You are logged in as <span className="font-medium">{user.name}</span> with role{' '}
              <span className="font-medium capitalize">{user.role.replace('_', ' ')}</span>.
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="space-x-4">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
              
              {user && (
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              )}
            </div>

            {!user && (
              <div className="text-sm text-gray-600">
                <p>
                  You need to{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    sign in
                  </Link>{' '}
                  to access this page.
                </p>
              </div>
            )}

            {/* Help Information */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Contact your administrator if you believe this is an error</li>
                <li>• Make sure you're signed in with the correct account</li>
                <li>• Some pages require specific user roles or permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
