import { USER_ACCESS_ROLES, AuthStore } from '@wings-shared/security';
import { useMemo } from 'react';
const { REF_DATA_ADMIN, REF_DATA_DM_USER } = USER_ACCESS_ROLES;

export const usePermitModuleSecurity = () => {
  const roles = useMemo(() => AuthStore.permissions.roles.map(x => x.Name), [ AuthStore.permissions.roles ]);
  // Persons with DM and Admin Role can perform the most of the actions in Permit apps
  const isEditable =
    roles.includes(REF_DATA_ADMIN) || roles.includes(REF_DATA_DM_USER);

  return {
    isEditable,
    // Admin users can edit settings screen inside the Permit app
    isSettingsEditable: roles.includes(REF_DATA_ADMIN),
  };
};

