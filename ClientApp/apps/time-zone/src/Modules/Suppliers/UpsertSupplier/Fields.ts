import { auditFields } from '@wings/shared';
import { IAPIGridRequest, Utilities } from '@wings-shared/core';
export const fields = {
  ...auditFields,
  supplierType: {
    label: 'Supplier Type',
    rules: 'required',
  },
  name: {
    label: 'Supplier Name',
    rules: 'required|string|between:1,240',
  },
  emailAddress: {
    label: 'Email Address',
    rules: 'string|email|between:1,200',
  },
  serviceLevel: {
    label: 'Service Level',
    rules: 'required',
  },
  countries: {
    label: 'Countries',
    value: [],
  },
  states: {
    label: 'States',
    value: [],
  },
  cities: {
    label: 'Cities',
    value: [],
  },
  supplierAirports: {
    value: [],
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type',
  },
};

/* istanbul ignore next */
export const getLabel = (model, fieldKey) => {
  const { country, state, name, code, airportCode, label } = model;
  const cityCode = [ state?.code, country?.code ].filter(Boolean).join(', ');

  switch (fieldKey) {
    case 'states':
      return [ name, country?.code || code ].filter(Boolean).join(', ');
    case 'cities':
      return [ name, cityCode || code ].filter(Boolean).join(', ');
    case 'airports':
      return [ name, airportCode || code ].filter(Boolean).join(', ');
    default:
      return label;
  }
};

/* istanbul ignore next */
export const getTooltip = (model, fieldKey): string => {
  const { name, country, state, label } = model;
  if (fieldKey === 'states') {
    return [ name, country.name ].filter(Boolean).join(', ') || name || '';
  }
  return [ name, state.name, country.name ].filter(Boolean).join(', ') || label || '';
};

export const airportRequest = (searchValue): IAPIGridRequest => {
  return {
    searchCollection: JSON.stringify([
      Utilities.getFilter('DisplayCode', searchValue),
      Utilities.getFilter('SourceLocationId', searchValue, 'or'),
      Utilities.getFilter('Name', searchValue, 'or'),
    ]),
    specifiedFields: [ 'AirportId', 'DisplayCode', 'Name', 'CAPPSAirportName', 'SourceLocationId', 'Status' ],
    filterCollection: JSON.stringify([ Utilities.getFilter('Status.Name', 'Active') ]),
  };
};
