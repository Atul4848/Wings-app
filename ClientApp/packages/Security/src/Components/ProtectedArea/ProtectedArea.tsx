import React, { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import AuthStore from '../../Stores/Auth.store';

type ProtectedAreaProps = PropsWithChildren<{
  roles?: string[];
  permissions?: string[];
  exactRoles?: boolean;
  exactPermissions?: boolean;
  redirect?: string;
}>;

const ProtectedArea: FC<ProtectedAreaProps> = ({
   roles = [],
   permissions = [],
   redirect = null,
   exactRoles = false,
   exactPermissions = false,
   children,
}: ProtectedAreaProps) => {
  const hasAnyRole = AuthStore.permissions.hasAnyRole(roles);
  const hasAllRoles = AuthStore.permissions.hasAllRoles(roles);
  const hasAnyPermission = AuthStore.permissions.hasAnyPermission(permissions);
  const hasAllPermissions = AuthStore.permissions.hasAllPermissions(permissions);

  if (localStorage.debugger) {
    console.log('%cProtected Area Init', 'color: mediumOrchid; font-size: 13px;');
    console.group();
    console.log('Roles:', roles);
    console.log('Permissions:', permissions);
    console.log('hasAnyRole:', hasAnyRole);
    console.log('hasAllRoles:', hasAllRoles);
    console.log('hasAnyPermission:', hasAnyPermission);
    console.log('hasAllPermissions:', hasAllPermissions);
    console.groupEnd();
  }

  let hasAccessByRoles: boolean;

  if (!roles.length) {
    hasAccessByRoles = true;
  } else {
    hasAccessByRoles = exactRoles ? hasAllRoles : hasAnyRole;
  }

  let hasAccessByPermissions: boolean;

  if (!permissions.length) {
    hasAccessByPermissions = true;
  } else {
    hasAccessByPermissions = exactPermissions ? hasAllPermissions : hasAnyPermission;
  }

  if (localStorage.debugger) {
    console.log('%cProtected Area Check', 'color: mediumOrchid; font-size: 13px;');
    console.group();
    console.log(`hasAccessByPermissions: "${hasAccessByPermissions}"`);
    console.log(`hasAccessByRoles: "${hasAccessByRoles}"`);
    console.log(children);
    console.groupEnd();
  }

  if (hasAccessByPermissions && hasAccessByRoles) {
    return <>{children}</>;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return null;
};

export default ProtectedArea;