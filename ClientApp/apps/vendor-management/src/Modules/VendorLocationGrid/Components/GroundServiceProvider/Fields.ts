import { auditFields } from '@wings/shared';

export const fields = {
  ...auditFields,
  id: {
    label: 'Id',
  },
  vendorLocation: {
    label: 'Vendor Location',
  },
  appliedVendorLocation:{
    label: 'Applied Vendor Location',
  },
  otherName:{
    label: 'Other Name'
  },
  status:{
    label: 'Status',
  },
  groundServiceProviderOperationType:{
    label: 'Ground Service Provider Operation Type',
  },
}