import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPISalesRep } from '../Interfaces';

@modelProtection
export class SalesRepModel extends CoreModel {
  email: string;
  firstName: string;
  lastName: string;

  constructor(data?: Partial<SalesRepModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPISalesRep): SalesRepModel {
    if (!apiData) {
      return new SalesRepModel();
    }
    const data: Partial<SalesRepModel> = {
      ...apiData,
      id: apiData.salesRepId,
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new SalesRepModel(data);
  }

  static deserializeList(apiDataList: IAPISalesRep[]): SalesRepModel[] {
    return apiDataList ? apiDataList.map(apiData => SalesRepModel.deserialize(apiData)) : [];
  }
}
