import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader } from '@/components/common/Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, initializing } = useSelector((state) => state.auth);
  const location = useLocation();

  // Wait for auth status to be checked on page reload
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
