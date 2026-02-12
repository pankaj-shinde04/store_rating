import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const signupSchema = yup.object().shape({
  name: yup.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name cannot exceed 60 characters')
    .matches(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .required('Name is required'),
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string()
    .oneOf(['normal_user', 'store_owner', 'admin'], 'Please select a valid role')
    .required('Please select your role'),
  address: yup.string()
    .max(400, 'Address cannot exceed 400 characters')
    .optional()
});

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Simulate API call
      const response = await mockSignup(data);
      
      if (response.success) {
        // Use AuthContext login method
        login(response.data.user, response.data.tokens);
        
        // Navigate based on selected role
        const redirectPath = getRedirectPath(data.role);
        navigate(redirectPath);
      } else {
        setServerError(response.error || 'Registration failed');
      }
    } catch (error) {
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock API function - replace with actual API call
  const mockSignup = async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful signup based on selected role
        resolve({
          success: true,
          data: {
            user: {
              id: 1,
              name: data.name,
              email: data.email,
              role: data.role,
              address: data.address || null
            },
            tokens: {
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token'
            }
          }
        });
      }, 1500);
    });
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/owner/dashboard';
      case 'normal_user':
        return '/user/stores';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{serverError}</div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name (20-60 characters)"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be 8-16 characters with at least one uppercase letter and one special character
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Select Your Role
              </label>
              <div className="mt-1 relative">
                <select
                  {...register('role')}
                  className={`appearance-none block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose your role...</option>
                  <option value="normal_user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-2 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  {...register('address')}
                  rows={3}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your address (max 400 characters)"
                />
              </div>
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optional: Maximum 400 characters
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          {/* Password Requirements */}
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800">Password Requirements:</h4>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                <li>8-16 characters long</li>
                <li>At least one uppercase letter</li>
                <li>At least one special character (!@#$%^&*)</li>
                <li>Can contain numbers and lowercase letters</li>
              </ul>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-800">Role Information:</h4>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li><strong>Normal User:</strong> Can browse stores and submit ratings</li>
                <li><strong>Store Owner:</strong> Can manage stores and view ratings</li>
                <li><strong>Administrator:</strong> Full system access and management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
