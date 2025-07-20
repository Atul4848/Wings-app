import { auditFields } from '@wings/shared';
import { regex } from '@wings-shared/core';


export const fields = {
  ...auditFields,
  id: {
    label: 'Id',
  },
  groundServiceProviderAppliedVendorLocation: {
    label: 'Vendor Location',
  },
  legalBusinessName: {
    label: 'Legal business name',
    rules: 'string|between:2,100'
  },
  managerName: {
    label: 'Manager name',
    rules: 'string|between:2,100'
  },
  assitManagerName: {
    label: 'Assistant Manager Name',
    rules: 'string|between:2,100'
  },
  primaryPhoneNo: {
    label: 'Primary phone number*',
    rules: 'required|string|between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  secondaryPhoneNo: {
    label: 'Secondary phone number',
    rules: 'string|between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  fax: {
    label: 'Fax number',
    rules: 'string|between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  email: {
    label: 'Primary email*',
    rules: `required|string|regex:${regex.email}`
  },
  secondaryEmail: {
    label: 'Secondary email',
    rules: `regex:${regex.email}`
  }
};