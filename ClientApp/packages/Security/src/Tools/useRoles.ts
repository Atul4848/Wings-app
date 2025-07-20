import { useEffect, useState } from 'react';
import { reaction } from 'mobx';

import AuthStore from '../Stores/Auth.store';
import { USER_ACCESS_ROLES } from '../Enums/UserRoles.enum';

export function useRoles(roles: (typeof USER_ACCESS_ROLES | string)[]): { hasAnyRole: boolean; hasAllRoles: boolean } {
  const [hasAnyRole, setHasAnyRole] = useState<boolean>(false);
  const [hasAllRoles, setHasAllRoles] = useState<boolean>(false);

  useEffect(() => {
    const disposer = reaction(
      () => AuthStore.permissions.roles,
      () => {
        const permissionsStore = AuthStore.permissions;

        setHasAnyRole(permissionsStore.hasAnyRole(roles as any));
        setHasAllRoles(permissionsStore.hasAllRoles(roles as any));
      },
      { fireImmediately: true }
    );

    return () => disposer();
  }, []);

  return {
    hasAnyRole,
    hasAllRoles,
  };
}
