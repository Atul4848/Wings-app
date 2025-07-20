import { USER_ACCESS_ROLES, AuthStore } from '@wings-shared/security';
import { useMemo } from 'react';
const { REF_DATA_ADMIN, AIRCRAFT_FP_ADMIN, AIRCRAFT_FP_DM_USER } = USER_ACCESS_ROLES;

export const useAircraftModuleSecurity = () => {
  const roles = useMemo(() => AuthStore.permissions.roles.map(x => x.Name), [ AuthStore.permissions.roles ]);
  // Persons with FP Admin, FP Data Management and Admin Role can perform the most of the actions in Aircraft apps
  const isEditable =
    roles.includes(REF_DATA_ADMIN) || roles.includes(AIRCRAFT_FP_ADMIN) || roles.includes(AIRCRAFT_FP_DM_USER);

  return {
    isEditable,
    // Admin users can edit settings screen inside the Aircraft app
    isSettingsEditable: roles.includes(REF_DATA_ADMIN),
    isAirframeSettingsEditable: roles.includes(REF_DATA_ADMIN) || roles.includes(AIRCRAFT_FP_ADMIN),
    isFPDMUser: roles.includes(AIRCRAFT_FP_DM_USER),
  };
};
