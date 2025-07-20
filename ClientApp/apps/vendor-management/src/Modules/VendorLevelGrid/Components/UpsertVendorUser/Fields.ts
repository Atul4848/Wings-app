import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const addUserEmailField = {
  ...auditFields,
  email: {
    label: 'Email ID*',
    rules: `required|string|between:2,200|regex:${regex.email}`,
  },
};

export const addUserEmailPhoneField = {
  ...auditFields,
  email: {
    label: 'Email ID*',
    rules: `required|string|between:2,200|regex:${regex.email}`,
  },
  username: {
    label: 'User Name*',
    rules: 'required',
  },
  phoneNo: {
    label: 'Phone Number*',
    rules: 'required|string|between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/',
  },
  isOptedSms: {
    label: 'I Acknowledge that this cell phone number will receive a text message regarding Uplink Log in Details.*',
    rules: 'required',
  },
};
export const addUserFields = {
  ...auditFields,
  id: {
    label: 'Vendor Id',
  },
  username: {
    label: 'User Name*',
    rules: 'string|between:2,200',
  },
  phoneNo: {
    label: 'Phone Number*',
    rules: 'string|between:2,200',
  },
  email: {
    label: 'Email ID*',
    rules: `required|string|between:2,200|regex:${regex.email}`,
  },
  givenName: {
    label: 'First Name*',
    rules: 'required|string|between:1,50',
  },
  surName: {
    label: 'Surname*',
    rules: 'required|string|between:1,50',
  },
  userRole: {
    label: 'User Role*',
    rules: 'required',
  },
  vendorUserLocation: {
    label: 'Location',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  userId: {
    label: 'UserId',
  },
};
