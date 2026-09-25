import React from 'react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { Role, Permission } from '../../types/authTypes';
import { UnauthorizedPage } from '../../pages/UnauthorizedPage';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
  onNavigateHome?: () => void;
}

/**
 * Enterprise RBAC Guard ensuring user possesses required roles or permissions
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  fallback,
  onNavigateHome,
}) => {
  const { user, hasRole, hasPermission } = useAuthentication();

  // 1. Role verification
  if (allowedRoles && allowedRoles.length > 0) {
    const roleMatches = hasRole(allowedRoles);
    if (!roleMatches) {
      return (
        <>
          {fallback || (
            <UnauthorizedPage
              requiredRoles={allowedRoles}
              userRole={user?.role}
              onNavigateHome={onNavigateHome}
            />
          )}
        </>
      );
    }
  }

  // 2. Fine-grained permissions verification
  if (requiredPermissions && requiredPermissions.length > 0) {
    const permissionMatches = hasPermission(requiredPermissions);
    if (!permissionMatches) {
      return (
        <>
          {fallback || (
            <UnauthorizedPage
              requiredRoles={allowedRoles || ['Admin']}
              userRole={user?.role}
              onNavigateHome={onNavigateHome}
            />
          )}
        </>
      );
    }
  }

  return <>{children}</>;
};
