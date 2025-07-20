import { IAPIExportedEventsError } from './../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class ExportedEventsErrorModel extends CoreModel {
  worldEventImportId: number = 0;
  rowNumber: number = 0;
  runId: string = '';
  message: string = '';

  constructor(data?: Partial<ExportedEventsErrorModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIExportedEventsError): ExportedEventsErrorModel {
    if (!apiData) {
      return new ExportedEventsErrorModel();
    }
    return new ExportedEventsErrorModel({ ...apiData });
  }

  static deserializeList(apiDataList: IAPIExportedEventsError[]): ExportedEventsErrorModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIExportedEventsError) => ExportedEventsErrorModel.deserialize(apiData))
      : [];
  }
}
