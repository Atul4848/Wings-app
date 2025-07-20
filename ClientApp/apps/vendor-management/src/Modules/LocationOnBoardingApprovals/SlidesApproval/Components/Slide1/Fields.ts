import { auditFields } from '@wings/shared';
export const fields = {
  ...auditFields,
  id: {
    label: 'Slide 1 Id',
  },
  vendorId: {
    label: 'Vendor Id',
  },
  airportReference:{
    label: 'ICAO',
  },
  hqAddressCountry:{
    label: 'Country'
  },
  hqAddressState:{
    label: 'State'
  },
  hqAddressCity:{
    label: 'City'
  },
  locationName:{
    label: 'Location Name*',
    rules: 'required|string|between:1,200'
  },
  companyLegalName:{
    label: 'Legal name of your company*',
    rules: 'required|string|between:1,200',
  },
  companyWebsite:{
    label: 'Company website*',
    rules: 'required|string|between:3,500|regex:/^[^\\s]+\\.[^\\s]+$/'
  },
  accountReceivableContactName:{
    label: 'Account receivable Contact name*',
    rules: 'required|string|between:1,200'
  },
  accountReceivableContactPhone:{
    label: 'Account receivable Contact phone no*',
    rules: 'required|between:7,20|regex:/^\\+?[0-9]{1,3}([-.\\s]?\\d{1,4}){1,5}$/'
  },
  appliedOperationType:{
    label: 'Operation Type'
  },
  appliedOperationTypeId:{
    label: 'Operation Type Id'
  },
  tempLocationId:{
    label: 'Temp Location Id'
  },
}