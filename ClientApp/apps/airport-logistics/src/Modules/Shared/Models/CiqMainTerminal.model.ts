import { CoreModel, OperatingHoursModel } from './index';
import { IAPICiqMainTerminal, IAPICiqMainTerminalRequest } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CiqMainTerminalModel extends CoreModel {
  subComponentId: number = null;
  ciqOvertimeRequired: string = null;
  operatingHours: OperatingHoursModel[] = [];

  constructor(data?: Partial<CiqMainTerminalModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICiqMainTerminal): CiqMainTerminalModel {
    if (!apiData) {
      return new CiqMainTerminalModel();
    }

    const data: Partial<CiqMainTerminalModel> = {
      subComponentId: apiData.SubComponentId,
      ciqOvertimeRequired: apiData.CIQOvertimeRequired,
      operatingHours: OperatingHoursModel.deserializeList(apiData.OperatingHours),
    };

    return new CiqMainTerminalModel(data);
  }

  static ApiModel(data: CiqMainTerminalModel, status: boolean): IAPICiqMainTerminalRequest {
    if (!status) {
      return null;
    }

    // we don't need to include SubComponentId incase a section is ignored and there is no master data available
    const optionalParam = data.subComponentId && {
      SubComponentId: data.subComponentId,
    }

    return {
      ...optionalParam,
      CIQOvertimeRequired: data.ciqOvertimeRequired,
      OperatingHours: OperatingHoursModel.ApiModels(data.operatingHours, status),
    }
  }
}
