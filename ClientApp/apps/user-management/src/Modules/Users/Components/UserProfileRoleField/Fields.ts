import { ROLE_ACCESS_TYPE } from '../../../Shared/Enums';

export const fields = {
  applicationName: {
    label: 'Applications Name',
  },
  appService: {
    label: 'App Service',
    rules: 'required',
  },
  roles: {
    label: 'Role',
    rules: 'required',
  },
  customer: {
    label: 'Customer',
  },
  registry: {
    label: 'Registry',
  },
  sites: {
    label: 'Sites',
  },
  accessType: {
    label: 'Access Type',
    value: ROLE_ACCESS_TYPE.STANDARD,
  },
  validFrom: {
    label: 'Valid From',
    placeholder: 'Select date',
    value: null,
  },
  validTo: {
    label: 'Valid To',
    placeholder: 'Select date',
    value: null,
  },
};
  