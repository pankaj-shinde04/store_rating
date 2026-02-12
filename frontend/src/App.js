import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Unauthorized from './pages/common/Unauthorized';
import UserDashboard from './pages/user/UserDashboard';
import StoreListing from './pages/user/StoreListing';
import StoreDetails from './pages/user/StoreDetails';
import StoreOwnerDashboard from './pages/store-owner/StoreOwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

// Welcome page component
const Welcome = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Store Rating Platform</h1>
      <p className="text-xl text-gray-600 mb-8">Rate and review local businesses</p>
      <div className="space-x-4">
        <a 
          href="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
        >
          Login
        </a>
        <a 
          href="/signup" 
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium"
        >
          Sign Up
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/stores" 
              element={
                <ProtectedRoute requiredRole="normal_user">
                  <StoreListing />
                </ProtectedRoute>
              } 
            />
            
            {/* Unauthorized Page */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Normal User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute requiredRole="normal_user">
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stores/:id" 
              element={
                <ProtectedRoute requiredRole="normal_user">
                  <StoreDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Store Owner Routes */}
            <Route 
              path="/store-owner/dashboard" 
              element={
                <ProtectedRoute requiredRole="store_owner">
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
