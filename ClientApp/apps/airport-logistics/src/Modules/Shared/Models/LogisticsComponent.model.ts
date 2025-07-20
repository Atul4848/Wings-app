import { CoreModel } from './index';
import { IAPILogisticsComponent, IAPILogisticsComponentRequest } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class LogisticsComponentModel extends CoreModel {
  id: number = null;
  subComponentId: number = null;
  subComponentName: string = '';

  constructor(data?: Partial<LogisticsComponentModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPILogisticsComponent): LogisticsComponentModel {
    if (!apiData) {
      return new LogisticsComponentModel();
    }

    const data: Partial<LogisticsComponentModel> = {
      id: apiData.Id,
      subComponentId: apiData.SubComponentId,
      subComponentName: apiData.SubComponentName,
    };

    return new LogisticsComponentModel(data);
  }

  static deserializeList(apiDataList: IAPILogisticsComponent[]): LogisticsComponentModel[] {
    return Array.isArray(apiDataList)
      ? apiDataList.map(apiData => LogisticsComponentModel.deserialize(apiData))
      : []
  }

  static ApiModel(data: LogisticsComponentModel): IAPILogisticsComponentRequest {
    return {
      SubComponentId: data.subComponentId,
    }
  }

  static ApiModels(data: LogisticsComponentModel[], status: boolean): IAPILogisticsComponentRequest[] {
    if (!status) {
      return null;
    }
    return Array.isArray(data)
      ? data.map(apiData => LogisticsComponentModel.ApiModel(apiData))
      : [];
  }
}
