import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  const hasGuestId = typeof window !== 'undefined' && localStorage.getItem('guest_id');
  
  if (!isAuthenticated && !hasGuestId) {
    return <Navigate to="/login" />;
  }
  
  return children;
}; 