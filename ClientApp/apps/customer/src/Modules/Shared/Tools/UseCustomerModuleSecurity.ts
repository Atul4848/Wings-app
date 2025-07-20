import { USER_ACCESS_ROLES, AuthStore } from '@wings-shared/security';
import { useMemo } from 'react';
const { REF_DATA_ADMIN, REF_DATA_DM_USER, REF_DATA_GLOBAL_USER } = USER_ACCESS_ROLES;

export const useCustomerModuleSecurity = () => {
  const roles = useMemo(() => AuthStore.permissions.roles.map(x => x.Name), [ AuthStore.permissions.roles ]);
  // Persons with Admin and Data Management Role can perform the most of the actions in Customer app
  const isEditable = roles.includes(REF_DATA_ADMIN) || roles.includes(REF_DATA_DM_USER);

  return {
    isEditable,
    // Admin users can edit settings screen inside the Customer app
    isSettingsEditable: roles.includes(REF_DATA_ADMIN),

    //Wings Global user
    isGlobalUser: roles.includes(REF_DATA_GLOBAL_USER),
  };
};
