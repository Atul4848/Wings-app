import { CoreModel, getYesNoNullToBoolean, modelProtection } from '@wings-shared/core';
import { IFeeInformation } from '../Interfaces';

@modelProtection
export class FeeInformationModel extends CoreModel {
  customsFeesApply: boolean;
  overtimeFeesApply: boolean;
  cashAccepted: boolean;

  constructor(data?: Partial<FeeInformationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IFeeInformation): FeeInformationModel {
    if (!apiData) {
      return new FeeInformationModel();
    }
    const data: Partial<FeeInformationModel> = {
      ...apiData,
      id: apiData.feeInformationId || apiData.id,
    };
    return new FeeInformationModel(data);
  }

  static deserializeList(apiDataList: IFeeInformation[]): FeeInformationModel[] {
    return apiDataList ? apiDataList.map(apiData => FeeInformationModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IFeeInformation {
    return {
      id: this.id || 0,
      customsFeesApply: getYesNoNullToBoolean(this.customsFeesApply),
      overtimeFeesApply: getYesNoNullToBoolean(this.overtimeFeesApply),
      cashAccepted: getYesNoNullToBoolean(this.cashAccepted),
    };
  }
}
