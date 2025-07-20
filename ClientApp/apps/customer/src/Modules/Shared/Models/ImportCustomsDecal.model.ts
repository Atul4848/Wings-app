import { CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIImportCustomsDecal } from '../Interfaces';

export class ImportCustomsDecalModel extends CoreModel {
  processId: string = '';
  processDate: string = '';
  blobName: string = '';
  logFileName: string;
  validationMessage: string;
  customsDecalImportFileStatus: SettingsTypeModel;

  constructor(data?: Partial<ImportCustomsDecalModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIImportCustomsDecal): ImportCustomsDecalModel {
    if (!apiData) {
      return new ImportCustomsDecalModel();
    }
    const data: Partial<ImportCustomsDecalModel> = {
      ...apiData,
      customsDecalImportFileStatus: SettingsTypeModel.deserialize({
        id:
          apiData.customsDecalImportFileStatus
            ?.customsDecalImportFileStatusId ||
          apiData.customsDecalImportFileStatus?.id,
        name: apiData.customsDecalImportFileStatus.name,
      }),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new ImportCustomsDecalModel(data);
  }

  static deserializeList(
    apiDataList: IAPIImportCustomsDecal[]
  ): ImportCustomsDecalModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIImportCustomsDecal) =>
        ImportCustomsDecalModel.deserialize(apiData)
      )
      : [];
  }
}
