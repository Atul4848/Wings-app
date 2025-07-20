import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
import { VALIDATION_REGEX } from '../../../Shared/Enums/Spacing.enum';

export const fields = {
  ...auditFields,
  id: {
    label: 'Vendor Id',
  },
  code: {
    label: 'Vendor Code*',
    rules: `required|string|between:2,3|regex:${regex.alphaNumericWithoutSpaces}|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`,
  },
  name: {
    label: 'Vendor Name*',
    rules: 'required|string|between:1,200',
  },
  vendorStatusDetails:{
    label: 'Vendor Status Details*',
    rules: 'string|between:1,500'
  },
  vendorStatus:{
    label: 'Vendor Status*',
    rules: 'required'
  },
  legalCompanyName:{
    label: 'Legal Company Name',
    rules: 'string|between:1,200',
  },
  addressTypeId:{
    label: 'Address Type Id',
  },
  vendorAddressId: {
    label: 'Vendor Address Id',
  },
  addressLine1:{
    label: 'Address Line 1',
    rules: 'string|between:1,200',
  },
  addressLine2:{
    label: 'Address Line 2',
    rules: 'string|between:1,200',
  },
  hqAddressCountry:{
    label: 'HQ Address Country',
  },
  hqAddressState:{
    label: 'HQ Address State',
  },
  hqAddressCity:{
    label: 'HQ Address City',
  },
  hqAddressZipCode:{
    label: 'HQ Address Zip Code',
    rules: 'string|between:1,10',
  },
  is3rdPartyLocation:{
    label: '3rd party location',
  },
  isInvitationPacketSend:{
    label: 'Is Invitation Packet Send',
  },
}