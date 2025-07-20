import { CoreModel, OperatingHoursModel } from './index';
import { IAPIMainTerminal, IAPIMainTerminalRequest } from '../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class MainTerminalModel extends CoreModel {
  subComponentId: number = null;
  ciqRequired: string = null;
  operatingHours: OperatingHoursModel[] = [];
  crewPaxPriority: string = null;
  crewPaxPriorityExplanation: string = null;

  constructor(data?: Partial<MainTerminalModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIMainTerminal): MainTerminalModel {
    if (!apiData) {
      return new MainTerminalModel();
    }

    const data: Partial<MainTerminalModel> = {
      subComponentId: apiData.SubComponentId,
      ciqRequired: apiData.CIQRequired,
      operatingHours: OperatingHoursModel.deserializeList(apiData.OperatingHours),
      crewPaxPriority: apiData.CrewPaxPriority,
      crewPaxPriorityExplanation: apiData.CrewPaxPriorityExplanation,
    };

    return new MainTerminalModel(data);
  }

  static ApiModel(data: MainTerminalModel, status: boolean): IAPIMainTerminalRequest {
    if (!status) {
      return null;
    }

    // we don't need to include SubComponentId incase a section is ignored and there is no master data available
    const optionalParam = data.subComponentId && {
      SubComponentId: data.subComponentId,
    }

    return {
      ...optionalParam,
      CIQRequired: data.ciqRequired,
      OperatingHours: OperatingHoursModel.ApiModels(data.operatingHours, status),
      CrewPaxPriority: data.crewPaxPriority,
      CrewPaxPriorityExplanation: data.crewPaxPriorityExplanation,
    }
  }
}
