import { regex } from '@wings-shared/core';

export const fields = {
  csdUsername: {
    label: 'Legacy CSD User',
  },
  oracleUser: {
    label: 'Oracle User',
  },
  assumeIdentity: {
    label: 'Assume Identity',
  },
  manualAssumedIdentity: {
    label: 'Assumed Identity CSD User Id',
    rules: 'numeric|between:0,99999',
  },
  lastLogin: {
    label: 'Last Login',
  },
  activeCustomerId: {
    label: 'Customer Name',
  },
  activeCustomerSite: {
  },
};
