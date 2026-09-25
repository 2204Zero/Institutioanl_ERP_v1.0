import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { Role } from '../../types/authTypes';

export interface AdminRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  onNavigateHome?: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  allowedRoles = ['SuperAdmin', 'Admin', 'Dean'],
  onNavigateHome,
}) => {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={allowedRoles} onNavigateHome={onNavigateHome}>
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
};
