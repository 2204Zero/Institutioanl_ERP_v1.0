import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGlobalStore } from '../../store/StoreContext';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { state } = useGlobalStore();
  const userRole = state.user?.role || 'STUDENT';

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
