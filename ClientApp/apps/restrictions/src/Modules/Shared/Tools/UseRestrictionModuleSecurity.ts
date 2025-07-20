import { USER_ACCESS_ROLES, AuthStore } from '@wings-shared/security';
import { useMemo } from 'react';
const { REF_DATA_ADMIN, RESTRICTIONS_QRG_ADMIN, RESTRICTIONS_QRG_DM_USER } = USER_ACCESS_ROLES;

export const useRestrictionModuleSecurity = () => {
  const roles = useMemo(() => AuthStore.permissions.roles.map(x => x.Name), [ AuthStore.permissions.roles ]);

  const isQRGAdmin = roles.includes(REF_DATA_ADMIN) || roles.includes(RESTRICTIONS_QRG_ADMIN);
  const isEditable = isQRGAdmin || roles.includes(RESTRICTIONS_QRG_DM_USER);

  return {
    isEditable,
    isQRGAdmin,
    isSettingsEditable: roles.includes(REF_DATA_ADMIN),
    isQRGDataManagement: roles.includes(RESTRICTIONS_QRG_DM_USER),
  };
};
