import { IAPIWorldAware } from './../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class WorldAwareModel extends CoreModel {
  refreshFrequency: string = '';
  lastRefreshDate: string = '';

  constructor(data?: Partial<WorldAwareModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIWorldAware): WorldAwareModel {
    if (!apiData) {
      return new WorldAwareModel();
    }
    return new WorldAwareModel({ ...apiData });
  }

  static deserializeList(apiDataList: IAPIWorldAware[]): WorldAwareModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIWorldAware) => WorldAwareModel.deserialize(apiData)) : [];
  }
}
