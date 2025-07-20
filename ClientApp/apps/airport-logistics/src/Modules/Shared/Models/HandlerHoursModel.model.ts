import { OperatingHoursModel } from './OperatingHours.model';
import { CoreModel } from './Core.model';
import { IAPIHandlerHours } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class HandlerHoursModel extends CoreModel {
  subComponentId: number = null;
  operatingHours: OperatingHoursModel[] = [];

  constructor(data?: Partial<HandlerHoursModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIHandlerHours): HandlerHoursModel {
    if (!apiData) {
      return new HandlerHoursModel();
    }

    const data: Partial<HandlerHoursModel> = {
      subComponentId: apiData.SubComponentId,
      operatingHours: OperatingHoursModel.deserializeList(apiData.OperatingHours),
    };

    return new HandlerHoursModel(data);
  }
}
