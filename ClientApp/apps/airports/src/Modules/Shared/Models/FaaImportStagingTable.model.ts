import { FAA_MERGE_STATUS } from '../Enums';
import { IAPIFaaImportStagingTable } from '../Interfaces';
import { FaaImportStagingPropertiesModel } from './FaaImportStagingProperties.model';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class FaaImportStagingTableModel extends CoreModel implements ISelectOption {
  id: number = 0;
  tableName: string = '';
  faaImportStagingProperties: FaaImportStagingPropertiesModel[];
  faaMergeStatus: FAA_MERGE_STATUS;
  category: string = '';

  constructor(data?: Partial<FaaImportStagingTableModel>) {
    super(data);
    Object.assign(this, data);
    this.faaImportStagingProperties =
      data?.faaImportStagingProperties?.map(x => new FaaImportStagingPropertiesModel(x)) || [];
  }

  static deserialize(apiData: IAPIFaaImportStagingTable): FaaImportStagingTableModel {
    if (!apiData) {
      return new FaaImportStagingTableModel();
    }
    const data: Partial<FaaImportStagingTableModel> = {
      id: apiData.id,
      tableName: apiData.tableName,
      category: apiData.category,
      faaMergeStatus: apiData.faaMergeStatus,
      faaImportStagingProperties: FaaImportStagingPropertiesModel.deserializeList(apiData.faaImportStagingProperties),
    };
    return new FaaImportStagingTableModel(data);
  }

  static deserializeList(apiData: IAPIFaaImportStagingTable[]): FaaImportStagingTableModel[] {
    return apiData
      ? apiData.map((data: IAPIFaaImportStagingTable) => FaaImportStagingTableModel.deserialize(data))
      : [];
  }

  public get label(): string {
    return this.tableName;
  }

  public get value(): string | number {
    return this.id;
  }
}
