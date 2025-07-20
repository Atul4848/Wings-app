import { CoreModel, modelProtection, IdNameCodeModel } from '@wings-shared/core';
import { FAA_MERGE_STATUS, mapFaaRunwayDetailCategory } from '../Enums';
import { IAPIFaaImportStagingProperty, IAPIFaaImportStagingTableAndProperty } from '../Interfaces';

@modelProtection
export class FaaPropertyTableViewModel extends CoreModel {
  tableName: string = '';
  faaMergeStatus: FAA_MERGE_STATUS;
  isStaging: boolean = false;

  // Child Views
  propertyName: string = '';
  oldValue: string = '';
  newValue: IdNameCodeModel;
  processMessage: string = '';
  category: string = '';

  // used for audit history tree reference
  path: number[];
  parentTableId: number;

  constructor(data?: Partial<FaaPropertyTableViewModel>) {
    super(data);
    Object.assign(this, data);
  }

  // Use For Display Only
  public get formattedTableName(): string {
    if (this.category && this.tableName) {
      return this.category.length === 1
        ? `${this.tableName} (${mapFaaRunwayDetailCategory[this.category]})`
        : `${this.tableName} (${this.category})`;
    }
    return this.tableName;
  }

  // If table name available then it's a staging table record
  public get isStagingTable(): boolean {
    return Boolean(this.tableName);
  }

  static deserialize(apiData: IAPIFaaImportStagingTableAndProperty): FaaPropertyTableViewModel {
    if (!apiData) {
      return new FaaPropertyTableViewModel();
    }
    return new FaaPropertyTableViewModel({
      ...apiData,
      ...this.deserializeAuditFields(apiData),
      newValue: IdNameCodeModel.deserialize({
        name: apiData.newValue,
        code: apiData.newValueCode,
        id: apiData.newValueId,
      }),
    });
  }

  public serialize(faaImportStagingId: number): IAPIFaaImportStagingProperty {
    return {
      id: this.id,
      newValue: this.newValue?.name,
      newValueCode: this.newValue?.code,
      newValueId: this.newValue?.id,
      faaImportStagingId
    };
  }
}
