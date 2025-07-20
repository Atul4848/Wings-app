import { modelProtection } from '@wings-shared/core';
import { IAPIFlightPlanChangeRecords } from '../Interfaces';
import { FlightPlanFormatChangeRecordModel } from './FlightPlanFormatChangeRecord.model';

@modelProtection
export class FlightPlanChangeRecordModel extends FlightPlanFormatChangeRecordModel {
  format: string = '';
  flightPlanFormatId: number = 0;

  constructor(data?: Partial<FlightPlanChangeRecordModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFlightPlanChangeRecords): FlightPlanChangeRecordModel {
    if (!apiData) {
      return new FlightPlanChangeRecordModel();
    }
    const data: Partial<FlightPlanChangeRecordModel> = {
      ...FlightPlanFormatChangeRecordModel.deserialize(apiData),
      id: apiData.id,
      format: apiData.flightPlanFormat.format,
      flightPlanFormatId: apiData.flightPlanFormat.flightPlanFormatId,
    };
    return new FlightPlanChangeRecordModel(data);
  }

  static deserializeList(apiDataList: IAPIFlightPlanChangeRecords[]): FlightPlanChangeRecordModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIFlightPlanChangeRecords) => FlightPlanChangeRecordModel.deserialize(apiData))
      : [];
  }
}
