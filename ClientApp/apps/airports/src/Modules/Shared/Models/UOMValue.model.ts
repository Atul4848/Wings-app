import { CoreModel, IBaseApiResponse, modelProtection } from '@wings-shared/core';
@modelProtection
export class UOMValueModel extends CoreModel {
  id: number = 0;
  value: string = '';

  constructor(data?: Partial<UOMValueModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiStateType: IBaseApiResponse): UOMValueModel {
    if (!apiStateType) {
      return new UOMValueModel();
    }

    return new UOMValueModel({ ...apiStateType });
  }

  static deserializeList(apiDataList: IBaseApiResponse[]): UOMValueModel[] {
    return apiDataList ? apiDataList.map((apiData: IBaseApiResponse) => UOMValueModel.deserialize(apiData)) : [];
  }
}
