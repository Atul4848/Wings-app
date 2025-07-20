import { useEffect, useState } from 'react';
import { reaction } from 'mobx';

import AuthStore from '../Stores/Auth.store';

export function usePermissions(permissions: string[] = []): { hasAnyPermission: boolean; hasAllPermissions: boolean } {
  const [hasAllPermissions, setHasAllPermissions] = useState<boolean>(false);
  const [hasAnyPermission, setHasAnyPermission] = useState<boolean>(false);

  useEffect(() => {
    const disposer = reaction(
      () => AuthStore.permissions.roles,
      () => {
        const permissionsStore = AuthStore.permissions;

        setHasAllPermissions(permissionsStore.hasAllPermissions(permissions));
        setHasAnyPermission(permissionsStore.hasAnyPermission(permissions));
      },
      { fireImmediately: true }
    );

    return () => disposer();
  }, []);

  return {
    hasAllPermissions,
    hasAnyPermission,
  };
}
