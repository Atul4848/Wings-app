import {
  CoreModel,
  IBaseApiResponse,
  ISelectOption,
  modelProtection,
} from '@wings-shared/core';
import { IAPIOperator } from '../Interfaces';
import { CustomerModel } from './Customer.model';

@modelProtection
export class OperatorModel extends CoreModel implements ISelectOption {
  name: string;
  associatedCustomers: CustomerModel[];

  constructor(data?: Partial<OperatorModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIOperator): OperatorModel {
    if (!apiData) {
      return new OperatorModel();
    }
    const data: Partial<OperatorModel> = {
      ...apiData,
      id: apiData.operatorId || apiData.id,
      associatedCustomers: CustomerModel.deserializeList(apiData.associatedCustomers),
      ...this.deserializeAuditFields(apiData),
    };
    return new OperatorModel(data);
  }

  static deserializeList(apiDataList: IAPIOperator[]): OperatorModel[] {
    return apiDataList ? apiDataList.map(apiData => OperatorModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): IBaseApiResponse {
    return {
      id: this.id,
      name: this.name,
      ...this._serialize(),
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
