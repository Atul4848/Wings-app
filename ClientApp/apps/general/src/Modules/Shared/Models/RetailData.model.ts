import { DATE_FORMAT, Utilities, modelProtection } from '@wings-shared/core';
import { IAPIRetailDataResponse } from '../Interfaces';
import { RetailDataOptions } from './RetailDataOptions.model';
import moment from 'moment';

@modelProtection
export class RetailDataModel {
  id: string = '';
  status: string = '';
  startDate: string = '';
  username: string = '';
  endDate: string = '';
  option: RetailDataOptions;

  constructor(data?: Partial<RetailDataModel>) {
    Object.assign(this, data);
    this.option = data?.option;
  }

  static deserialize(retailData: IAPIRetailDataResponse): RetailDataModel {
    if (!retailData) {
      return new RetailDataModel();
    }
    const data: Partial<RetailDataModel> = {
      id: retailData.Id,
      status: retailData.Status,
      startDate: retailData.StartDate,
      username: retailData.Username,
      endDate:
        retailData.Status == 'ENQUEUED' || retailData.Status == 'PROCESSING'
          ? '-'
          : Utilities.getformattedDate(
            moment.utc(retailData.EndDate).local().format(DATE_FORMAT.API_FORMAT),
            DATE_FORMAT.SDT_DST_FORMAT
          ),
      option: RetailDataOptions.deserialize(retailData.Option),
    };
    return new RetailDataModel(data);
  }

  static deserializeList(retailData: IAPIRetailDataResponse[]): RetailDataModel[] {
    return retailData
      ? retailData.map((retailData: IAPIRetailDataResponse) => RetailDataModel.deserialize(retailData))
      : [];
  }
}
