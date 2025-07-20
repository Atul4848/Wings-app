import { USER_ACCESS_ROLES, AuthStore } from '@wings-shared/security';
import { useMemo } from 'react';
const {
  REF_DATA_ADMIN,
  REF_DATA_DM_USER,
  GEOGRAPHIC_APP_UA_USER,
  GEOGRAPHIC_APP_UWA_MARKETING_USER,
} = USER_ACCESS_ROLES;

export const useGeographicModuleSecurity = () => {
  const roles = useMemo(() => AuthStore.permissions.roles.map(x => x.Name), [ AuthStore.permissions.roles ]);
  // Persons with DM and Admin Role can perform the most of the actions in wings apps
  const isEditable = roles.includes(REF_DATA_ADMIN) || roles.includes(REF_DATA_DM_USER);
  // users with role UA user and UWA marketing users can edit the events screen
  const isEventEditable = roles.includes(GEOGRAPHIC_APP_UA_USER) || roles.includes(GEOGRAPHIC_APP_UWA_MARKETING_USER);
  // Admin and UWA Marketing users can edit settings screen inside the geographic app
  const isSettingsEditable = isEditable || roles.includes(GEOGRAPHIC_APP_UWA_MARKETING_USER);

  return {
    isEditable,
    isRefDataAdmin: roles.includes(REF_DATA_ADMIN),
    isEventEditable: isEditable || isEventEditable,
    isSettingsEditable,
  };
};
