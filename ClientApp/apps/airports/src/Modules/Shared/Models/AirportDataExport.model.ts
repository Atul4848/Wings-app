import { CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirportDataExport, IAPIAirportDataExportRequest } from '../Interfaces';
import { RequestedReportTypeModel } from './RequestedReportType.model';
import { AIRPORT_DATA_EXPORT_STATUS } from '../Enums';

export class AirportDataExportModel extends CoreModel {
  startDate: string = '';
  endDate: string = '';
  airportDataExportRequestStatus: SettingsTypeModel;
  airportDataExportRequestedReportTypes: RequestedReportTypeModel[];
  airportDataExportReportTypes: SettingsTypeModel[];
  airportDataExportRequestStatusId: AIRPORT_DATA_EXPORT_STATUS = AIRPORT_DATA_EXPORT_STATUS.NEW;

  constructor(data?: Partial<AirportDataExportModel>) {
    super(data);
    Object.assign(this, data);
    this.airportDataExportRequestStatusId =
      this.airportDataExportRequestStatus?.id ||
      data?.airportDataExportRequestStatusId ||
      AIRPORT_DATA_EXPORT_STATUS.NEW;
  }

  static deserialize(apiData: IAPIAirportDataExport): AirportDataExportModel {
    if (!apiData) {
      return new AirportDataExportModel();
    }
    const data: Partial<AirportDataExportModel> = {
      ...apiData,
      id: apiData.airportDataExportId || apiData.id,
      airportDataExportRequestStatus: new SettingsTypeModel({
        ...apiData.airportDataExportRequestStatus,
        id: apiData.airportDataExportRequestStatus.airportDataExportRequestStatusId,
      }),
      airportDataExportRequestedReportTypes: RequestedReportTypeModel.deserializeList(
        apiData.airportDataExportRequestedReportTypes
      ),
      airportDataExportReportTypes: apiData.airportDataExportRequestedReportTypes?.map(
        x =>
          new SettingsTypeModel({
            ...x.airportDataExportReportType,
            id: x.airportDataExportReportType.airportDataExportReportTypeId,
          })
      ),
    };
    return new AirportDataExportModel(data);
  }

  public serialize(): IAPIAirportDataExportRequest {
    return {
      id: this.id || 0,
      airportDataExportRequestReportTypeIds: this.airportDataExportReportTypes?.map(x => x?.id),
      airportDataExportRequestStatusId: this.airportDataExportRequestStatus?.id || AIRPORT_DATA_EXPORT_STATUS.NEW,
    };
  }

  static deserializeList(retailData: IAPIAirportDataExport[]): AirportDataExportModel[] {
    return retailData
      ? retailData.map((retailData: IAPIAirportDataExport) => AirportDataExportModel.deserialize(retailData))
      : [];
  }
}
