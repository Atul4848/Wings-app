import { agGridUtilities } from '@wings-shared/custom-ag-grid';
import { FAA_IMPORT_COMPARISON_FILTERS, FAA_IMPORT_DATA_FILTERS, FAA_IMPORT_STAGING_ENTITY_TYPE } from '../../Shared';
import { faaImportDataFiltersMap, gridFilters } from '../fields';
import { Utilities, IAPIGridRequest } from '@wings-shared/core';
import { IUseSearchHeader } from '@wings-shared/form-controls';

const runwayHideFields = [ FAA_IMPORT_COMPARISON_FILTERS.CITY_NAME, FAA_IMPORT_COMPARISON_FILTERS.STATE_NAME ];
const runwayBySourceLocation = runwayHideFields.concat([
  FAA_IMPORT_COMPARISON_FILTERS.AIRPORT_NAME,
  FAA_IMPORT_COMPARISON_FILTERS.ICAO,
  FAA_IMPORT_COMPARISON_FILTERS.SOURCE_LOCATION_ID,
]);

export const frequencyAirportOptions = (isRunway, isRunwayBySourceLocation) => [
  agGridUtilities.createSelectOption(
    FAA_IMPORT_COMPARISON_FILTERS,
    isRunwayBySourceLocation
      ? FAA_IMPORT_COMPARISON_FILTERS.RUNWAY_ID
      : FAA_IMPORT_COMPARISON_FILTERS.SOURCE_LOCATION_ID,
    'defaultOption',
    x => {
      if (isRunway) {
        return !(isRunwayBySourceLocation ? runwayBySourceLocation.includes(x) : runwayHideFields.includes(x));
      }
      return !Utilities.isEqual(x, FAA_IMPORT_COMPARISON_FILTERS.RUNWAY_ID);
    }
  ),
  agGridUtilities.createSelectOption(FAA_IMPORT_DATA_FILTERS, FAA_IMPORT_DATA_FILTERS.ALL, 'faaImportOption'),
];

// All | Removed | Added | Filters | Airport | Runways
export const getFaaFilterCollection = (
  entityType: FAA_IMPORT_STAGING_ENTITY_TYPE,
  params: any, // Url Params
  isRunwayBySourceLocation?: boolean,
  searchHeader?: IUseSearchHeader
): IAPIGridRequest => {
  if (!searchHeader) {
    return {};
  }
  const chip = searchHeader.getFilters().chipValue?.valueOf();

  // Match Selected Option From Header
  const property = gridFilters.find(({ uiFilterType }) =>
    Utilities.isEqual(uiFilterType as string, searchHeader.searchType)
  );

  // Other Option Key
  const filterKey = searchHeader.selectInputsValues.get('faaImportOption');
  const searchFilterKey = property?.columnId || '';

  const searchFilter = searchHeader.searchValue
    ? { [ searchFilterKey ]: searchHeader.searchValue }
    : Boolean(chip)
      ? { faaMergeStatus: chip[0]?.value }
      : null;

  const sourceLocation = isRunwayBySourceLocation ? { sourceLocationId: params.sourceLocationId } : {};

  const filters = [
    {
      processId: params.processId,
      faaComparisonType: faaImportDataFiltersMap[filterKey],
      faaImportStagingEntityType: entityType,
      ...searchFilter,
      ...sourceLocation,
    },
  ];

  return {
    filterCollection: JSON.stringify(filters),
  };
};
