import { auditFields } from '@wings/shared';
import { regex } from '@wings-shared/core';

export const fields = {
  ...auditFields,
  id: {
    label: 'Id',
  },
  coordinatingOffice: {
    label: 'ICAO/IATA',
  },
  legalBusinessName: {
    label: 'Handler\'s legal business name',
  },
  vendorName: {
    label: 'Doing business as (D.B.A)',
  },
  managerName: {
    label: 'Manager name',
    rules: 'string|between:2,100'
  },
  assitManagerName: {
    label: 'Assistant manager name',
    rules: 'string|between:2,100'
  },
  opsPrimaryPhoneNo: {
    label: 'Operations Phone number*',
    rules: 'required|between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  opsSecondaryPhoneNo: {
    label: 'Operations secondary Phone number',
    rules: 'between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  opsFaxNo: {
    label: 'Operations Fax number',
    rules: 'between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  opsPrimaryEmail: {
    label: 'Operations Primary Email*',
    rules: `required|regex:${regex.email}`
  },
  opsSecondaryEmail: {
    label: 'Operations Secondary Email',
    rules: `regex:${regex.email}`
  }
};