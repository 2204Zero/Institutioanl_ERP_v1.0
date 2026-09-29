import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export interface RoleRouteProps {
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  children?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles = [],
  requiredPermissions = [],
  fallbackPath = '/unauthorized',
  children,
}) => {
  const { hasRole, hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleAuthorized = allowedRoles.length === 0 || hasRole(allowedRoles);
  const permissionAuthorized =
    requiredPermissions.length === 0 || hasPermission(requiredPermissions);

  if (!roleAuthorized || !permissionAuthorized) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
