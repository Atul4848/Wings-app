import { CoreModel, OperatingHoursModel, ValueUnitPairModel } from './index';
import { IAPIVipAreaTerminal, IAPIVipAreaTerminalRequest } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class VipAreaTerminalModel extends CoreModel {
  subComponentId: string = null;
  feeType: string = null;
  operatingHours: OperatingHoursModel[] = [];
  overTimeCost: number = null;
  overTimeType: string = null;
  overtimePossible: string = null;
  usageCost: number = null;
  usageCostPair: ValueUnitPairModel;
  overTimeCostPair: ValueUnitPairModel;

  constructor(data?: Partial<VipAreaTerminalModel>) {
    super();
    Object.assign(this, data);
    this.usageCostPair = new ValueUnitPairModel(data?.usageCostPair);
    this.overTimeCostPair = new ValueUnitPairModel(data?.overTimeCostPair);
  }

  static deserialize(apiData: IAPIVipAreaTerminal): VipAreaTerminalModel {
    if (!apiData) {
      return new VipAreaTerminalModel();
    }

    const usageCost = apiData.UsageCost ? String(apiData.UsageCost) : '';
    const overTimeCost = apiData.OverTimeCost ? String(apiData.OverTimeCost) : '';

    const data: Partial<VipAreaTerminalModel> = {
      subComponentId: apiData.SubComponentId,
      feeType: apiData.FeeType,
      operatingHours: OperatingHoursModel.deserializeList(apiData.OperatingHours),
      overTimeCost: apiData.OverTimeCost,
      overTimeType: apiData.OverTimeType,
      overtimePossible: apiData.OvertimePossible,
      usageCost: apiData.UsageCost,
      usageCostPair: ValueUnitPairModel.deserialize(usageCost, apiData.FeeType),
      overTimeCostPair: ValueUnitPairModel.deserialize(overTimeCost, apiData.OverTimeType),
    };

    return new VipAreaTerminalModel(data);
  }

  static ApiModel(data: VipAreaTerminalModel, status: boolean, isIgnored: boolean = false): IAPIVipAreaTerminalRequest {
    if (!status) {
      return null;
    }

    // we don't need to include SubComponentId incase a section is ignored and there is no master data available
    const optionalParam = data.subComponentId && {
      SubComponentId: data.subComponentId,
    }

    return {
      ...optionalParam,
      OvertimePossible: data.overtimePossible,
      FeeType: data.usageCostPair.unit,
      OverTimeCost: this.getNumberOrNullValue(data.overTimeCostPair.value),
      OverTimeType: data.overTimeCostPair.unit,
      UsageCost: this.getNumberOrNullValue(data.usageCostPair.value),
      OperatingHours: OperatingHoursModel.ApiModels(data.operatingHours, status),
    };
  }
}
