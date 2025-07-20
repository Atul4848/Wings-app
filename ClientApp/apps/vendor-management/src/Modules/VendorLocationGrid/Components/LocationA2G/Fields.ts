import { auditFields } from '@wings/shared';

export const fields = {
  ...auditFields,
  id: {
    label: 'Id',
  },
  vendorLocationId: {
    label: 'Vendor Location Id',
  },
  a2GLocationType:{
    label: 'UA Agent location Type*',
    rules: 'required'
  },
  isA2GCommCopy:{
    label: 'UA Agent Comm Copy',
  },
  locationDocUri:{
    label: 'UA Agent location PDF',
  },
  arrivalLogistic:{
    label: 'UA Agent Arrival Logistics',
    rules: 'max:1000'
  },
  departureLogistic:{
    label: 'UA Agent Departure Logistics',
    rules: 'max:1000'
  },
  a2GEmail:{
    label: 'UA Agent Email',
  },
}