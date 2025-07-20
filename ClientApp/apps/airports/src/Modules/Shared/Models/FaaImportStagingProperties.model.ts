import { CoreModel, modelProtection } from '@wings-shared/core';
import { FAA_MERGE_STATUS } from '../Enums';
import { IAPIFaaImportStagingProperty } from '../Interfaces';

@modelProtection
export class FaaImportStagingPropertiesModel extends CoreModel {
  id: number = 0;
  propertyName: string = '';
  oldValue: string = '';
  newValue: string = '';
  newValueCode: string = '';
  newValueId: number = null;
  faaMergeStatus: FAA_MERGE_STATUS;

  constructor(data?: Partial<FaaImportStagingPropertiesModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFaaImportStagingProperty): FaaImportStagingPropertiesModel {
    if (!apiData) {
      return new FaaImportStagingPropertiesModel();
    }
    return new FaaImportStagingPropertiesModel(apiData);
  }

  static deserializeList(apiData: IAPIFaaImportStagingProperty[]): FaaImportStagingPropertiesModel[] {
    return apiData
      ? apiData.map((data: IAPIFaaImportStagingProperty) => FaaImportStagingPropertiesModel.deserialize(data))
      : [];
  }
}
