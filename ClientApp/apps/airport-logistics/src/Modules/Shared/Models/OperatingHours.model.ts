import { CoreModel } from './Core.model';
import { IAPIOperatingHours, IAPIOperatingHoursRequest } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class OperatingHoursModel extends CoreModel {
  airportFacilityTimingId: number = null;
  day: string = '';
  timeFrom: string = '';
  timeTo: string = '';

  constructor(data?: Partial<OperatingHoursModel>) {
    super();
    Object.assign(this, data);
    this.timeFrom = this.getFormattedTime(data?.timeFrom) || '';
    this.timeTo = this.getFormattedTime(data?.timeTo) || '';
  }

  static deserialize(apiData: IAPIOperatingHours): OperatingHoursModel {
    if (!apiData) {
      return new OperatingHoursModel();
    }

    const data: Partial<OperatingHoursModel> = {
      airportFacilityTimingId: apiData.AirportFacilityTimingId,
      day: apiData.Day,
      timeFrom: apiData.FromTime,
      timeTo: apiData.ToTime,
    };

    return new OperatingHoursModel(data);
  }

  static deserializeList(apiDataList: IAPIOperatingHours[]): OperatingHoursModel[] {
    return Array.isArray(apiDataList) ? apiDataList.map(apiData => OperatingHoursModel.deserialize(apiData)) : [];
  }

  static ApiModel(data: OperatingHoursModel, isAirport: boolean): IAPIOperatingHoursRequest {
    const optionProps = isAirport ? { AirportFacilityTimingId: data.airportFacilityTimingId } : null;
    return {
      Day: data.day,
      FromTime: data.timeFrom,
      ToTime: data.timeTo,
      ...optionProps,
    };
  }

  static ApiModels(
    data: OperatingHoursModel[],
    isApproved: boolean,
    isAirport: boolean = true
  ): IAPIOperatingHoursRequest[] {
    if (!isApproved) {
      return null;
    }
    return Array.isArray(data) ? data.map(apiData => OperatingHoursModel.ApiModel(apiData, isAirport)) : null;
  }
}
