import { IAPIFlightPlanChangeRecord } from '../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class FlightPlanFormatChangeRecordModel extends CoreModel {
  id: number = 0;
  requestedBy: string = '';
  changedBy: string = '';
  changedDate: string = null;
  notes: string = '';

  constructor(data?: Partial<FlightPlanFormatChangeRecordModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFlightPlanChangeRecord): FlightPlanFormatChangeRecordModel {
    if (!apiData) {
      return new FlightPlanFormatChangeRecordModel();
    }
    const data: Partial<FlightPlanFormatChangeRecordModel> = {
      ...apiData,
      id: apiData.flightPlanFormatChangeRecordId,
      notes: apiData.notes?.trim().replace(/[\u200B-\u200D\uFEFF]/g, ''),
    };
    return new FlightPlanFormatChangeRecordModel(data);
  }

  public serialize(): IAPIFlightPlanChangeRecord {
    return {
      id: this.id,
      requestedBy: this.requestedBy,
      changedBy: this.changedBy,
      changedDate: this.changedDate,
      notes: this.notes,
    };
  }

  static deserializeList(apiDataList: Partial<IAPIFlightPlanChangeRecord>[]): FlightPlanFormatChangeRecordModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => FlightPlanFormatChangeRecordModel.deserialize(apiData)) : [];
  }
}
