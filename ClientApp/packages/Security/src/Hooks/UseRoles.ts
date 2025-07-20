import { debounce } from '@material-ui/core';
import { AuthStore } from '@wings-shared/security';
import { USER_ACCESS_ROLES } from '../Enums';
import { observable } from 'mobx';
import { useEffect, useState } from 'react';

export const useRolesV2 = (_roles: (typeof USER_ACCESS_ROLES | string)[]) => {
  // Needs to create this observable State as using hasPermission inside ag grid context not get updated with normal use state
  const [ roles ] = useState((): any =>
    observable({
      hasAnyRole: false,
      hasAllRoles: false,
      setHasAnyRole(r) {
        this.hasAnyRole = r;
      },
      setHasAllRoles(r) {
        this.hasAllRoles = r;
      },
    })
  );
  useEffect(
    debounce(() => {
      roles.setHasAnyRole(AuthStore.permissions.hasAnyRole(_roles as any));
      roles.setHasAllRoles(AuthStore.permissions.hasAllRoles(_roles as any));
    }, 200),
    [ AuthStore.permissions.permissions ]
  );

  return [ roles ];
};
