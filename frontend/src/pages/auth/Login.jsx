import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .required('Password is required'),
  role: yup.string()
    .oneOf(['normal_user', 'store_owner', 'admin'], 'Please select a valid role')
    .required('Please select your role'),
  rememberMe: yup.boolean()
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    console.log('🔍 onSubmit function called with data:', data);
    console.log('🔍 Email:', data.email);
    console.log('🔍 Role:', data.role);
    
    setIsLoading(true);
    setServerError('');

    try {
      console.log('🔍 Attempting login with:', data.email);
      console.log('🔍 Making API call to: http://localhost:3001/api/auth/login');
      
      // Real API call
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role
        })
      });

      console.log('🔍 API Response Status:', response.status);
      console.log('🔍 API Response Headers:', response.headers);

      const responseData = await response.json();
      console.log('🔍 Login Response Data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      if (responseData.success) {
        console.log('✅ Login successful, redirecting...');
        console.log('🔍 User data:', responseData.data.user);
        console.log('🔍 User role:', responseData.data.user.role);
        
        // Store tokens
        localStorage.setItem('accessToken', responseData.data.accessToken);
        localStorage.setItem('refreshToken', responseData.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(responseData.data.user));
        
        // Use AuthContext login method
        login(responseData.data.user, {
          accessToken: responseData.data.accessToken,
          refreshToken: responseData.data.refreshToken
        });
        
        console.log('🔍 AuthContext login called');
        
        // Navigate based on selected role
        const redirectPath = getRedirectPath(data.role);
        console.log('🔍 Redirecting to:', redirectPath);
        
        // Small delay to ensure AuthContext updates
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      } else {
        setServerError(responseData.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'normal_user':
        return '/user/dashboard';
      case 'store_owner':
        return '/store-owner/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit((data) => {
            console.log('🔍 Form submitted with data:', data);
            onSubmit(data);
          })}>
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{serverError}</div>
              </div>
            )}

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
                  id="email"
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
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
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
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Select Your Role
              </label>
              <div className="mt-1 relative">
                <select
                  {...register('role')}
                  id="role"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => console.log('Forgot password clicked')}
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="text-xs text-gray-600">
                <p><strong>Store Owner:</strong> owner@demo.com / 123456</p>
                <p><strong>Normal User:</strong> user@demo.com / 123456</p>
                <p><strong>Admin:</strong> admin@demo.com / 123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
