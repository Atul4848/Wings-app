import { CoreModel, OperatingHoursModel, ValueUnitPairModel } from './index';
import { IAPICiqGeneralAviationTerminal } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqGeneralAviationTerminalModel extends CoreModel {
  subComponentId: number = null;
  ciqAvailable: string = null;
  cost: number = null;
  costType: string = null;
  costPair: ValueUnitPairModel;
  limitedHoursPossible: string = null;
  operatingHours: OperatingHoursModel[] = [];

  constructor(data?: Partial<CiqGeneralAviationTerminalModel>) {
    super();
    Object.assign(this, data);
    this.costPair = new ValueUnitPairModel(data?.costPair);
  }

  public get ciqAvailableLabel(): string {
    return this.getYesOrNoOrValueLabel(this.ciqAvailable);
  }

  public get limitedHoursPossibleLabel(): string {
    return this.getYesOrNoOrValueLabel(this.limitedHoursPossible);
  }

  static deserialize(apiData: IAPICiqGeneralAviationTerminal): CiqGeneralAviationTerminalModel {
    if (!apiData) {
      return new CiqGeneralAviationTerminalModel();
    }

    const cost = apiData.Cost ? String(apiData.Cost) : '';
    const data: Partial<CiqGeneralAviationTerminalModel> = {
      subComponentId: apiData.SubComponentId,
      ciqAvailable: apiData.CIQAvailable,
      cost: apiData.Cost,
      costType: apiData.CostType,
      costPair: ValueUnitPairModel.deserialize(cost, apiData.CostType),
      limitedHoursPossible: apiData.LimitedHoursPossible,
      operatingHours: OperatingHoursModel.deserializeList(apiData.OperatingHours),
    };

    return new CiqGeneralAviationTerminalModel(data);
  }

  static ApiModel(data: CiqGeneralAviationTerminalModel, status: boolean, isIgnored: boolean = false): any {
    if (!status) {
      return null;
    }

    // we don't need to include SubComponentId incase a section is ignored and there is no master data available
    const optionalParam = data.subComponentId && {
      SubComponentId: data.subComponentId,
    }

    return {
      ...optionalParam,
      CIQAvailable: data.ciqAvailable,
      LimitedHoursPossible: data.limitedHoursPossible,
      Cost: this.getNumberOrNullValue(data.costPair.value),
      CostType: data.costPair.unit,
      OperatingHours: OperatingHoursModel.ApiModels(data.operatingHours, status),
    };
  }
}
