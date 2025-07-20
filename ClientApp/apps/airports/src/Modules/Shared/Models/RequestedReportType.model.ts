import { CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IRequestedReportType } from '../Interfaces';

export class RequestedReportTypeModel extends CoreModel {
  fileUrl: string = '';
  airportDataExportReportType: SettingsTypeModel;
  airportDataExportRequestStatus: SettingsTypeModel;

  constructor(data?: Partial<RequestedReportTypeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IRequestedReportType): RequestedReportTypeModel {
    if (!apiData) {
      return new RequestedReportTypeModel();
    }
    const data: Partial<RequestedReportTypeModel> = {
      ...apiData,
      airportDataExportReportType: new SettingsTypeModel({
        ...apiData.airportDataExportReportType,
        id: apiData.airportDataExportReportType.airportDataExportReportTypeId,
      }),
      airportDataExportRequestStatus: new SettingsTypeModel({
        ...apiData.airportDataExportRequestStatus,
        id: apiData.airportDataExportRequestStatus.airportDataExportRequestStatusId,
      }),
    };
    return new RequestedReportTypeModel(data);
  }

  static deserializeList(dataList: IRequestedReportType[]): RequestedReportTypeModel[] {
    return dataList ? dataList.map((data: IRequestedReportType) => RequestedReportTypeModel.deserialize(data)) : [];
  }
}
