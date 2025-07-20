import { IBaseApiResponse } from '@wings-shared/core';
import { FAA_IMPORT_STAGING_ENTITY_TYPE } from '../Enums';

export interface IAPIFAAImportComparison extends IBaseApiResponse {
  processId: number;
  sourceLocationId: string;
  icao: string;
  airportName: string;
  cityName: string;
  stateName: string;
  category: string;
  faaImportStagingTables: IAPIFaaImportStagingTable[];
  faaMergeStatus?: number;
  faaComparisonType?: number;
  // Updated Fields
  faaImportProcessId: number;
  faaImportStagingEntityType: number;
}

export interface IAPIFaaImportStagingTable extends IBaseApiResponse {
  tableName: string;
  faaImportStagingProperties: IAPIFaaImportStagingProperty[];
  faaMergeStatus: number;
  category: string;
}

export interface IAPIFaaImportStagingProperty {
  propertyName?: string;
  faaMergeStatus?: number;
  oldValue?: string;
  // For Save Edit Record
  id: number;
  faaImportStagingId?: number;
  newValue: string;
  newValueCode: string;
  newValueId: number;
}

export interface IAPIFaaImportStagingTableAndProperty extends IAPIFaaImportStagingProperty {
  tableName: string;
  faaImportStagingProperties: IAPIFaaImportStagingProperty[];
  faaMergeStatus: number;
  processMessage: string;
}

export interface IAPIMergeTableRequest {
  faaImportStagingEntityType: FAA_IMPORT_STAGING_ENTITY_TYPE;
  faaImportProcessId: string;
  faaImportStagingId: number;
  faaImportStagingTableAndProperties: FaaImportStagingTableAndProperty[];
}

export interface FaaImportStagingTableAndProperty {
  tableId: number;
  propertyIds: number[];
}

export interface IAPIFAAMergeByAirport {
  sourceLocationId: string;
  processId: string;
  faaImportStagingId: number;
  mergeRunways: boolean;
}
