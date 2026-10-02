import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGlobalStore } from '../../store/StoreContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useGlobalStore();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
