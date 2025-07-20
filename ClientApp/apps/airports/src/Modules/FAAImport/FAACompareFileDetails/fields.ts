import {
  FaaPropertyTableViewModel,
  FAA_IMPORT_EDITABLE_PROPERTIES,
  FAA_IMPORT_STAGING_ENTITY_TYPE,
  FAA_MERGE_STATUS,
  FaaImportStagingTableModel,
} from '../../Shared';
import { mapFaaScreenRules } from './validationRules';
import { Utilities, IdNameCodeModel } from '@wings-shared/core';

const autoCompleteFields = [
  'icao',
  'country',
  'countryName',
  'city',
  'cityName',
  'closestCity',
  'closestCityName',
  'state',
  'stateName',
  'airportFacilityType',
  'airportFacilityAccessLevel',
  'airportDataSource',
  'appliedAirportType',
  'appliedAirportUsageType',
  'militaryUseType',
  'airportOfEntry',
  'distanceUOM',
  'elevationUOM',
  'airportDirection',
  'accessLevel',
  'sourceType',
  'airportCategory',
  'weatherReportingSystem',
  'runwayLightTypeId',
  'runwayConditionId',
  'runwaySurfaceTreatmentId',
  'runwaySurfacePrimaryTypeId',
  'runwaySurfaceSecondaryTypeId',
  'runwayUsageType',
  'runwayRVRId',
  'runwayApproachLightId',
  'runwayVGSIId',
  'appliedRunwayApproachType',
  'appliedRunwayNavaids',
];

const selectControlFields = [ 'rvv', 'reil', 'centerlineLights', 'touchdownLights' ];

const multiSelectFields: string[] = [ 'RunwayRVRId' ];

export const getIsAutoComplete = (propertyName: string): boolean => {
  return autoCompleteFields.map(x => x.toLowerCase()).includes(propertyName?.split('.').pop().toLowerCase());
};

export const getIsSelectInput = (propertyName: string): boolean => {
  return selectControlFields.map(x => x.toLowerCase()).includes(propertyName?.split('.').pop().toLowerCase());
}

export const getIsMultiSelect = (propertyName: string): boolean => {
  return multiSelectFields.map(x => x.toLocaleLowerCase()).includes(propertyName?.toLowerCase());
};

// Check if Status Is Merged or Not
export const isDataMerged = (faaMergeStatus: string | FAA_MERGE_STATUS) => {
  return Utilities.isEqual(faaMergeStatus, FAA_MERGE_STATUS.MERGED);
};

// Used to Generate Tree Path
// https://www.ag-grid.com/javascript-data-grid/tree-data/
export const getGridData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): FaaPropertyTableViewModel[] => {
  let _startIndex = 1;
  const tableData = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    total.push(FaaPropertyTableViewModel.deserialize({ ...item, faaImportStagingProperties: [] }));
    // Check if child available
    if (item.faaImportStagingProperties?.length) {
      const result = getGridData(item.faaImportStagingProperties, item.path, true, item.id);
      total = total.concat(result);
    }
    return total;
  }, []);
  return tableData;
};

export const mapModel = (entity: any, entityType: FAA_IMPORT_EDITABLE_PROPERTIES): IdNameCodeModel => {
  switch (entityType) {
    case FAA_IMPORT_EDITABLE_PROPERTIES.STATE:
      return IdNameCodeModel.deserialize({
        id: entity.id,
        name: entity.commonName || entity.name,
        code: entity.cappsCode || entity.isoCode || entity.code,
      });
    case FAA_IMPORT_EDITABLE_PROPERTIES.CITY:
      return IdNameCodeModel.deserialize({
        id: entity?.id || null,
        name: entity?.commonName || null,
        code: entity?.cappsCode || null,
      });
    case FAA_IMPORT_EDITABLE_PROPERTIES.COUNTRY:
      return IdNameCodeModel.deserialize({
        id: entity.id,
        name: entity.commonName || entity.name,
        code: entity.isO2Code || entity.code,
        status: entity.status,
      });
    case FAA_IMPORT_EDITABLE_PROPERTIES.ICAO:
      return IdNameCodeModel.deserialize({
        id: entity.id,
        name: entity.code,
        code: entity.code,
      });
    default:
      return new IdNameCodeModel();
  }
};

export const mapModelList = (response, entity: FAA_IMPORT_EDITABLE_PROPERTIES): IdNameCodeModel[] => {
  return response.map(x => mapModel(x, entity));
};

// Get Airport Or Runway Field Rules
export const getFieldRules = (propertyName: string, stagingEntityType: FAA_IMPORT_STAGING_ENTITY_TYPE): string => {
  if (!propertyName) {
    return '';
  }

  const reduceValue = propertyName
    .split('.')
    .reduce((pre, curr) => {
      if (!pre) {
        return pre;
      }
      pre = pre[curr];
      return pre;
    }, mapFaaScreenRules[stagingEntityType])
    ?.toString();
  return reduceValue;
};

// Return Field Based on the field Key
export const getSearchProperty = (propertyName: string, fieldKey: string) => {
  const _property = propertyName?.split('.');
  return _property.length > 1 ? `${_property[0]}.${fieldKey}`.toLocaleLowerCase() : fieldKey;
};

export const getAssociatedProperty = (
  selectedTable: FaaImportStagingTableModel,
  property: FaaPropertyTableViewModel,
  fieldKey: string
) => {
  return selectedTable.faaImportStagingProperties.find(x =>
    Utilities.isEqual(x.propertyName, getSearchProperty(property.propertyName, fieldKey))
  );
};
