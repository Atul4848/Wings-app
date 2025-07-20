import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';

export const fields = {
  country: {
    label: 'Country*',
    rules: 'required',
  },
  permitType: {
    label: 'Permit Type*',
    rules: 'required',
  },
  isRequired: {
    label: 'Is Required',
  },
  accessLevel: {
    label: 'Access Level*',
    rules: 'required',
  },
  sourceType: {
    label: 'Source Type*',
    rules: 'required',
  },
  status: {
    label: 'Status*',
    rules: 'required',
  },
  hasRouteOrAirwayExtension: {
    label: 'Route/Airway Extension',
  },
  permitRouteAirwayExtensions: {
    value: [],
  },
  permitApplied: {
    fields: {
      permitAppliedTo: {
        label: 'Permit Applied To',
      },
      permitAppliedFIRs: {
        label: 'Included FIRs',
        value: [],
      },
      extendedByNM: {
        label: 'Extended by Nautical Miles',
        rules: `regex:${regex.onePlaceDecimal}`,
      },
      isPolygon: {
        label: 'Is Polygon',
      },
      geoJson: {
        label: 'Polygon GEOJSON',
        value: '',
      },
    },
  },
  ...auditFields,
};

export const routeFields = {
  airway: {
    label: 'Airway',
  },
  waypoint1: {
    label: 'Waypoint',
  },
  waypoint2: {
    label: 'Waypoint',
  },
};
