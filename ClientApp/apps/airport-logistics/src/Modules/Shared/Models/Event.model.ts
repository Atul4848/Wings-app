import { CoreModel } from './index';
import { IAPIEvent } from '../Interfaces/API-Event.interface';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class EventModel extends CoreModel {
  name: string = '';
  startDate: string = '';
  endDate: string = '';
  hotelShortage: string = '';
  id: number | string = '';

  constructor(data?: Partial<EventModel>) {
    super();
    Object.assign(this, data);
    this.startDate = this.getformattedDate(data?.startDate, 'DD-MMM-YYYY HH:mm');
    this.endDate = this.getformattedDate(data?.endDate, 'DD-MMM-YYYY HH:mm');
    this.id = data?.id || this.getTempId();
  }

  static deserialize(apiData: IAPIEvent): EventModel {
    if (!apiData) {
      return new EventModel();
    }

    const data: Partial<EventModel> = {
      name: apiData.Name,
      startDate: apiData.StartDate,
      endDate: apiData.EndDate,
      hotelShortage: apiData.HotelShortage,
      id: apiData.AirportEventId,
    };

    return new EventModel(data);
  }

  static deserializeList(apiDataList: IAPIEvent[]): EventModel[] {
    return Array.isArray(apiDataList) ? apiDataList.map(apiData => EventModel.deserialize(apiData)) : [];
  }
}
