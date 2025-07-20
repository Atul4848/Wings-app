import { AirportSettingsStore, FAA_IMPORT_EDITABLE_SETTINGS, FaaPropertyTableViewModel } from '../../Shared';
import { tapWithAction, Utilities, EntityMapModel } from '@wings-shared/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export const requiredDropdownFields: string[] = [ 'AirportFacilityType', 'City' ];
export const nonEditableFields: string[] = [
  'IATACode',
  'FAACode',
  'SourceLocationId',
  'AirportFacilityAccessLevel',
  'Country',
  'AirportManagerAddress.Country',
  'AirportOwnerAddress.Country',
];

const cityStatePropertyNames: string[] = [
  'City',
  'State',
  'AirportOwnerAddress.City',
  'AirportOwnerAddress.State',
  'AirportManagerAddress.City',
  'AirportManagerAddress.State',
].map(x => x.toLocaleLowerCase());

export const apiSettingsData = (propertyName: string, airportSettingsStore: AirportSettingsStore) => {
  let observableOfType = of<any>([]);

  switch (propertyName) {
    case FAA_IMPORT_EDITABLE_SETTINGS.AIRPORT_FACILITY_TYPE:
      observableOfType = airportSettingsStore.loadAirportFacilityTypes();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.AIRPORT_FACILITY_ACCESS_LEVEL:
      observableOfType = airportSettingsStore.loadAirportFacilityAccessLevels();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.APPLIED_AIRPORT_TYPE:
      observableOfType = airportSettingsStore
        .loadAirportTypes()
        .pipe(tapWithAction(response => response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }))));
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.APPLIED_AIRPORT_USAGE_TYPE:
      observableOfType = airportSettingsStore
        .loadAirportUsageTypes()
        .pipe(tapWithAction(response => response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }))));
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.AIRPORT_DATA_SOURCE:
      observableOfType = airportSettingsStore.loadAirportDataSources();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.MILITARY_USE_TYPE:
      observableOfType = airportSettingsStore.loadMilitaryUseTypes().pipe(map(x => x.results));
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.AIRPORT_OF_ENTRY:
      observableOfType = airportSettingsStore.loadAirportOfEntries().pipe(map(x => x.results));
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.DISTANCE_UOM:
    case FAA_IMPORT_EDITABLE_SETTINGS.ELEVATION_UOM:
      observableOfType = airportSettingsStore.loadDistanceUOMs();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.AIRPORT_DIRECTION:
      observableOfType = airportSettingsStore.loadAirportDirections();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.ACCESS_LEVEL:
      observableOfType = airportSettingsStore.getAccessLevels();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.SOURCE_TYPE:
      observableOfType = airportSettingsStore.getSourceTypes();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.AIRPORT_CATEGORY:
      observableOfType = airportSettingsStore.loadAirportCategory();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.WEATHER_REPORTING_SYSTEM:
      observableOfType = airportSettingsStore.loadWeatherReportingSystem();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_SURFACE_TREATMENT_ID:
      observableOfType = airportSettingsStore.loadRunwaySurfaceTreatments();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_SURFACE_PRIMARY_TYPE_ID:
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_SURFACE_SECONDARY_TYPE_ID:
      observableOfType = airportSettingsStore.loadRunwaySurfaceTypes();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_LIGHT_TYPE_ID:
      observableOfType = airportSettingsStore.loadRunwayLightTypes();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_CONDITION_ID:
      observableOfType = airportSettingsStore.loadRunwayConditions();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_USAGE_TYPE:
      observableOfType = airportSettingsStore.loadRunwayUsageTypes();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_RVR_ID:
      observableOfType = airportSettingsStore.loadRunwayRVR();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_APPROACH_LIGHT_ID:
      observableOfType = airportSettingsStore.loadRunwayApproachLight();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.RUNWAY_VGSI_ID:
      observableOfType = airportSettingsStore.loadRunwayVGSI();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.APPLIED_RUNWAY_APPROACH_TYPE:
      observableOfType = airportSettingsStore.loadRunwayApproachType();
      break;
    case FAA_IMPORT_EDITABLE_SETTINGS.APPLIED_RUNWAY_NAVAIDS:
      observableOfType = airportSettingsStore.loadRunwayNavaids();
      break;
    default:
      observableOfType = of([]);
      break;
  }
  return observableOfType;
};

// Generate Import File Title
export const getTitle = (selectedStagingRecord, isRunways: boolean): string => {
  if (!selectedStagingRecord) {
    return '';
  }
  const { sourceLocationId, icao, runwayId, airportName, cityName = '', stateName = '' } = selectedStagingRecord;
  const _icao = icao ? `(${icao})` : '';
  const files = isRunways
    ? [ sourceLocationId, airportName, _icao, runwayId ]
    : [ sourceLocationId, airportName, _icao, cityName, stateName ];

  return files.filter(Boolean).join(' - ');
};

// Get Country Or state Id based on City change
// I.e if user merge city then we needs to merge it's country and state also
// if user merge only state then we needs to merge country
// See: 89051
export const getCountryOrStateIds = (
  propertyIds: FaaPropertyTableViewModel[],
  tableData: FaaPropertyTableViewModel[]
) => {
  const filter = propertyIds.filter(x => cityStatePropertyNames.includes(x.propertyName.toLocaleLowerCase()));
  // if city or state not available then return
  if (!filter.length) {
    return [];
  }

  const filterStateAndCountries = filter.reduce((total, curr) => {
    const propertyName = curr.propertyName.split('.');
    // If City then state and country needs to merge if state then only county needs to merge
    const stateOrCountry = Utilities.isEqual([ ...propertyName ].pop() || '', 'city')
      ? [ 'country', 'state' ]
      : [ 'country' ];
    // concat Name
    const names =
      propertyName.length > 1
        ? stateOrCountry.map(x => [ propertyName[0], x ].join('.').toLocaleLowerCase())
        : stateOrCountry;

    total = total.concat(tableData.filter(x => names.includes(x.propertyName.toLocaleLowerCase())));
    return total;
  }, [] as FaaPropertyTableViewModel[]);

  return filterStateAndCountries;
};
