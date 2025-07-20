import { CUSTOMER_COMMS_FILTER_BY } from '../../../Shared';

export const customerAssociationFields = {
  customer: {
    label: 'Customer',
    placeHolder: 'Search Customer',
  },
  sites: {
    label: 'Site',
    placeHolder: 'Select Site',
    value: [],
  },
  offices: {
    label: 'Office',
    placeHolder: 'Select Office',
    value: [],
  },
};

export const communicationFields = {
  communicationLevel: {
    label: 'Communication Level',
    placeHolder: 'Search Communication Level',
    rules: 'required',
  },
  startDate: {
    label: 'Start Date',
    placeHolder: 'Start Date',
    rules: 'required',
  },
  endDate: {
    label: 'End Date',
    placeHolder: 'End Date',
  },
  communicationCategories: {
    label: 'Communication Categories',
    placeHolder: 'Search Communication Categories',
    value: [],
  },
  contactRole: {
    label: 'Contact Role',
    placeHolder: 'Select Contact Role',
  },
  priority: {
    label: 'Priority',
    placeHolder: 'Select Priority',
  },
  sequence: {
    label: 'Sequence',
    placeHolder: 'Sequence',
    rules: 'numeric|min:1|max:9999',
  },
  customer: {
    label: 'Customer',
    placeHolder: 'Search Customer',
  },
  sites: {
    label: 'Site',
    placeHolder: 'Select Site',
    value: [],
  },
  offices: {
    label: 'Office',
    placeHolder: 'Select Office',
    value: [],
  },
};

export const fields = {
  contactLinkType: {
    label: 'Select Contact',
    placeHolder: 'Select Contact',
  },
  contactMethod: {
    label: 'Contact Method',
    placeHolder: 'Select Method',
    rules: 'required',
  },
  contact: {
    label: 'Contact',
    placeHolder: 'Contact',
    rules: 'required',
  },
  contactExtension: {
    label: 'Contact Extension',
    placeHolder: 'Contact Extension',
    rules: 'string|between:1,50',
  },
  contactName: {
    label: 'Contact Name',
    placeHolder: 'Contact Name',
    rules: 'string|between:1,200',
  },
  contactType: {
    label: 'Contact Type',
    placeHolder: 'Select Contact Type',
  },
  operator: {
    label: 'Operator',
    placeHolder: 'Search Operator',
    value: [],
  },
  registry: {
    label: 'Registry',
    placeHolder: 'Search Registry',
    value: [],
  },
  communications: {
    fields: communicationFields,
  },
  sourceType: {
    label: 'Source Type',
    placeholder: 'Select Source Type',
  },
  accessLevel: {
    label: 'Access Level',
    placeholder: 'Select Access Level',
  },
  status: {
    label: 'Status',
    placeholder: 'Select Status',
  },
  createdBy: {
    label: 'Created By',
  },
  createdOn: {
    label: 'Created Date',
  },
  modifiedBy: {
    label: 'Updated By',
  },
  modifiedOn: {
    label: 'Updated Date',
  },
};

export const selectContactOptions = [
  {
    label: 'New Contact',
    value: '1',
  },
  {
    label: 'Link Existing Contact',
    value: '2',
  },
];

export const customerFields = [
  CUSTOMER_COMMS_FILTER_BY.CUSTOMER,
  CUSTOMER_COMMS_FILTER_BY.SITE,
  CUSTOMER_COMMS_FILTER_BY.OFFICE,
  CUSTOMER_COMMS_FILTER_BY.CUSTOMER_OFFICE,
  CUSTOMER_COMMS_FILTER_BY.CUSTOMER_REGISTRY,
];

export const disableCustomer = [ CUSTOMER_COMMS_FILTER_BY.CUSTOMER ];
export const disableSite = [ CUSTOMER_COMMS_FILTER_BY.SITE ];
export const disableOffice = [ CUSTOMER_COMMS_FILTER_BY.OFFICE, CUSTOMER_COMMS_FILTER_BY.CUSTOMER_OFFICE ];
