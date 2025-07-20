import { IAPIImportWorldEvent } from './../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class ImportWorldEventModel extends CoreModel {
  processDate: string = '';
  worldEventImportStatus: number = 1;
  blobName: string = '';
  runId: string = '';
  totalCount: number = 0;
  errorCount: number = 0;

  constructor(data?: Partial<ImportWorldEventModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIImportWorldEvent): ImportWorldEventModel {
    if (!apiData) {
      return new ImportWorldEventModel();
    }
    return new ImportWorldEventModel({ ...apiData });
  }

  static deserializeList(apiDataList: IAPIImportWorldEvent[]): ImportWorldEventModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIImportWorldEvent) => ImportWorldEventModel.deserialize(apiData))
      : [];
  }
}
