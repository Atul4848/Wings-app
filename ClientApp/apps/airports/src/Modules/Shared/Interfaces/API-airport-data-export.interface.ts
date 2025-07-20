import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAirportDataExport extends IBaseApiResponse {
  airportDataExportId: number;
  startDate: string;
  endDate: string;
  airportDataExportRequestedReportTypes: IRequestedReportType[];
  airportDataExportRequestStatus: IRequestStatus;
}

export interface IRequestedReportType {
  id: number;
  fileUrl: string;
  airportDataExportReportType: IReportType;
  airportDataExportRequestStatus: IRequestStatus;
}

interface IReportType {
  airportDataExportReportTypeId: number;
  name: string;
}

interface IRequestStatus {
  airportDataExportRequestStatusId: number;
  name: string;
}

export interface IAPIAirportDataExportRequest extends IBaseApiResponse {
  startDate?: string;
  endDate?: string;
  airportDataExportRequestReportTypeIds: number[];
  airportDataExportRequestStatusId: number;
}
