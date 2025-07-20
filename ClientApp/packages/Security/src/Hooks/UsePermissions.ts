import { debounce } from '@material-ui/core';
import { AuthStore } from '@wings-shared/security';
import { observable } from 'mobx';
import { useEffect, useState } from 'react';

export const usePermissionsV2 = _permissions => {
  // Needs to create this observable State as using hasPermission inside ag grid context not get updated with normal use state
  const [ permissions ] = useState((): any =>
    observable({
      hasAnyPermission: false,
      hasAllPermissions: false,
      setHasAnyPermission(p) {
        this.hasAnyPermission = p;
      },
      setHasAllPermissions(p) {
        this.hasAllPermissions = p;
      },
    })
  );
  useEffect(
    debounce(() => {
      permissions.setHasAnyPermission(AuthStore.permissions.hasAnyPermission(_permissions));
      permissions.setHasAllPermissions(AuthStore.permissions.hasAllPermissions(_permissions));
    }, 200),
    [ AuthStore.permissions.permissions ]
  );

  return [ permissions ];
};
