import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPICustomerAssociatedOperator } from '../Interfaces';

@modelProtection
export class CustomerAssociatedOperatorModel extends CoreModel {
  customerAssociatedOperatorId: number;
  startDate: string;
  endDate: string;
  operator: SettingsTypeModel;
  constructor(data?: Partial<CustomerAssociatedOperatorModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerAssociatedOperator): CustomerAssociatedOperatorModel {
    if (!apiData) {
      return new CustomerAssociatedOperatorModel();
    }
    const data: Partial<CustomerAssociatedOperatorModel> = {
      ...apiData,
      operator: new SettingsTypeModel({
        ...apiData.operator,
        id: apiData.operator.operatorId,
      }),
    };
    return new CustomerAssociatedOperatorModel(data);
  }

  static deserializeList(apiDataList: IAPICustomerAssociatedOperator[]): CustomerAssociatedOperatorModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerAssociatedOperatorModel.deserialize(apiData)) : [];
  }
}
