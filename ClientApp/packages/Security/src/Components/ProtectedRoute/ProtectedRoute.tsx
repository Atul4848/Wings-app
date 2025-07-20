import { Navigate } from 'react-router-dom';
import React from 'react';

import { usePermissions } from '../../Tools/UsePermissions';

export type ProtectedRouteProps = {
  role: string;
  permissions?: ('read' | 'create' | 'edit')[];
  isVisible: boolean;
  element: React.ReactElement;
  redirectPath: string;
  [key: string]: any;
}

export const ProtectedRoute = ({ role, permissions, isVisible, element, redirectPath, ...otherProps}: ProtectedRouteProps) => {
  const { hasRole, hasReadPermission, hasCreatePermission, hasEditPermission } = usePermissions(role);
  let hasPermission: boolean;

  if (!permissions || !permissions.length) {
    hasPermission = hasRole;
  } else {
    hasPermission = permissions.some((permission: 'read' | 'create' | 'edit') => {
      switch (permission) {
        case 'read':
          return hasReadPermission;
        case 'create':
          return hasCreatePermission;
        case 'edit':
          return hasEditPermission;
        default:
          return false;
      }
    });
  }

  if (isVisible && hasPermission) {
    return React.cloneElement(element, otherProps);
  }
  return <Navigate to={redirectPath} />;
};
