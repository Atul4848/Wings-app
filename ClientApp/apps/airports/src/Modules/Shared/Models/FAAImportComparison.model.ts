import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIFAAImportComparison } from '../Interfaces';
import { FaaImportStagingTableModel } from './FaaImportStagingTable.model';
import { FAA_COMPARISON_TYPE, FAA_IMPORT_STAGING_ENTITY_TYPE, FAA_MERGE_STATUS } from '../Enums';

@modelProtection
export class FAAImportComparisonModel extends CoreModel {
  processId: number;
  sourceLocationId: string;
  runwayId: string;
  icao: string;
  airportName: string;
  cityName: string;
  countryName: string;
  countryId: number;
  stateId: number;
  stateName: string;
  category: string;
  faaImportStagingTables: FaaImportStagingTableModel[];
  faaComparisonType: FAA_COMPARISON_TYPE;
  faaMergeStatus: FAA_MERGE_STATUS;
  processMessage: string;
  faaImportStagingEntityType: FAA_IMPORT_STAGING_ENTITY_TYPE;

  constructor(data?: Partial<FAAImportComparisonModel>) {
    super(data);
    Object.assign(this, data);
    this.faaImportStagingTables = data?.faaImportStagingTables?.map(a => new FaaImportStagingTableModel(a)) || [];
  }

  static deserialize(apiData: IAPIFAAImportComparison): FAAImportComparisonModel {
    if (!apiData) {
      return new FAAImportComparisonModel();
    }
    const data: Partial<FAAImportComparisonModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      processId: apiData.processId || apiData.faaImportProcessId, // || apiData.id
      faaImportStagingTables: FaaImportStagingTableModel.deserializeList(apiData.faaImportStagingTables),
    };
    return new FAAImportComparisonModel(data);
  }

  static deserializeList(apiDataList: IAPIFAAImportComparison[]): FAAImportComparisonModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => FAAImportComparisonModel.deserialize(apiData)) : [];
  }
}
