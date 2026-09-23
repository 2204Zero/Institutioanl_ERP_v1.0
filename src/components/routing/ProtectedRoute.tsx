import React from 'react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { LoginPage } from '../../pages/LoginPage';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Authentication Guard protecting internal ERP pages
 * Renders LoginPage if the user is unauthenticated or session has expired
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated } = useAuthentication();

  if (!isAuthenticated) {
    return <>{fallback || <LoginPage />}</>;
  }

  return <>{children}</>;
};
