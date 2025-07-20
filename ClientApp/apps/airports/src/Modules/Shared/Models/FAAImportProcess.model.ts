import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIFAAImportProcess } from '../Interfaces';
import { IMPORT_FILE_TYPE } from '../Enums';

@modelProtection
export class FAAImportProcess extends CoreModel {
  processDate: string;
  faaImportStatus: SettingsTypeModel;
  faaMergeAllStatus: SettingsTypeModel;
  blobName: string;
  processId: string;
  faaImportFileType: IMPORT_FILE_TYPE;
  validationMessage: string;

  constructor(data?: Partial<FAAImportProcess>) {
    super(data);
    Object.assign(this, data);
    this.faaImportStatus = new SettingsTypeModel(data?.faaImportStatus);
    this.faaMergeAllStatus = new SettingsTypeModel(data?.faaMergeAllStatus);
  }

  static deserialize(apiData: IAPIFAAImportProcess): FAAImportProcess {
    if (!apiData) {
      return new FAAImportProcess();
    }
    const data: Partial<FAAImportProcess> = {
      ...apiData,
      faaImportStatus: new SettingsTypeModel({
        ...apiData.faaImportStatus,
        id: apiData.faaImportStatus?.faaImportStatusId,
      }),
      faaMergeAllStatus: new SettingsTypeModel({
        ...apiData.faaMergeAllStatus,
        id: apiData.faaMergeAllStatus?.faaImportMergeAllStatusId,
      }),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new FAAImportProcess(data);
  }

  static deserializeList(apiDataList: any[]): FAAImportProcess[] {
    return apiDataList ? apiDataList.map((apiData: any) => FAAImportProcess.deserialize(apiData)) : [];
  }
}
