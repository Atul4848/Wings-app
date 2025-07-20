import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAssociatedOperators, IAssociatedOperatorRequest } from '../Interfaces';
import { OperatorModel } from './Operator.model';
import { CustomerRefModel } from '@wings/shared';

@modelProtection
export class AssociatedOperatorsModel extends CoreModel {
  startDate: string = '';
  endDate: string = '';
  operator: OperatorModel;
  customer: CustomerRefModel;

  constructor(data?: Partial<AssociatedOperatorsModel>) {
    super(data);
    Object.assign(this, data);
  }
  public get label(): string {
    return this.operator.name;
  }

  public get value(): number {
    return this.id;
  }
  static deserialize(apiData: IAPIAssociatedOperators): AssociatedOperatorsModel {
    if (!apiData) {
      return new AssociatedOperatorsModel();
    }
    const data: Partial<AssociatedOperatorsModel> = {
      ...apiData,
      id: apiData.associatedOperatorId || apiData.id,
      operator: OperatorModel.deserialize(apiData.operator),
      customer: CustomerRefModel.deserialize(apiData.customer),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AssociatedOperatorsModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedOperators[]): AssociatedOperatorsModel[] {
    return apiDataList ? apiDataList.map(apiData => AssociatedOperatorsModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(partyId: number): IAssociatedOperatorRequest {
    return {
      partyId,
      id: this.id,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      customerStartDate: this.customer?.startDate,
      customerEndDate: this.customer?.endDate,
      operatorId: this.operator?.id,
      customerName: this.customer?.name,
      customerNumber: this.customer?.number,
      ...this._serialize(),
    };
  }
}
