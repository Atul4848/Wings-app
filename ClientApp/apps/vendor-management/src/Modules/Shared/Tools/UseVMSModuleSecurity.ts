import { USER_ACCESS_ROLES, AuthStore } from '@wings-shared/security';
import { useMemo } from 'react';
import VmsModuleSecurity from './VmsModuleSecurity';
const { REF_DATA_ADMIN, REF_DATA_DM_USER, REF_DATA_SYSTEM_ADMIN, AIRPORTS_GRS_USER } = USER_ACCESS_ROLES;

export const useVMSModuleSecurity = () => {
  const roles = useMemo(() => AuthStore.permissions.roles.map(x => x.Name), [ AuthStore.permissions.roles ]);
  // Persons with DM and Admin Role can perform the most of the actions in wings apps
  const isEditable = VmsModuleSecurity.isEditable || roles.includes(REF_DATA_ADMIN) || roles.includes(REF_DATA_DM_USER);

  return {
    isEditable,
    isCustomEditable: isEditable || roles.includes(AIRPORTS_GRS_USER),
    isRefDataSystemAdmin: roles.includes(REF_DATA_SYSTEM_ADMIN),
    isDMUser: roles.includes(REF_DATA_DM_USER),
    isSettingsEditable: VmsModuleSecurity.isEditable || roles.includes(REF_DATA_ADMIN),
  };
};
