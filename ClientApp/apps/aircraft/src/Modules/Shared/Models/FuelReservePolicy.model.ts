import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIFuelReservePolicy } from '../Interfaces';

@modelProtection
export class FuelReservePolicyModel extends CoreModel implements ISelectOption {
  policyDescription: string = '';
  policyNumber: number = null;

  constructor(data?: Partial<FuelReservePolicyModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFuelReservePolicy): FuelReservePolicyModel {
    if (!apiData) {
      return new FuelReservePolicyModel();
    }
    const data: Partial<FuelReservePolicyModel> = {
      ...apiData,
    };
    return new FuelReservePolicyModel(data);
  }

  public serialize(): IAPIFuelReservePolicy {
    return {
      id: this.id,
      policyDescription: this.policyDescription,
      policyNumber: this.policyNumber,
    };
  }

  static deserializeList(apiDataList: IAPIFuelReservePolicy[]): FuelReservePolicyModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIFuelReservePolicy) => FuelReservePolicyModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
