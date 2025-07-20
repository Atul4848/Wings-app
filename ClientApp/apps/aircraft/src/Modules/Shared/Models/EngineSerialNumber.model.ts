import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIEngineSerialNumber } from '../Interfaces';

@modelProtection
export class EngineSerialNumberModel extends CoreModel {
  serialNumber: string;
  isTemporaryEngine: boolean;
  temporaryEngineDate: string;

  constructor(data?: Partial<EngineSerialNumberModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIEngineSerialNumber): EngineSerialNumberModel {
    if (!apiData) {
      return new EngineSerialNumberModel();
    }
    const data: Partial<EngineSerialNumberModel> = {
      ...apiData,
      id: apiData.engineSerialNumberId || apiData.id,
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new EngineSerialNumberModel(data);
  }

  static deserializeList(apiDataList: IAPIEngineSerialNumber[]): EngineSerialNumberModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEngineSerialNumber) => EngineSerialNumberModel.deserialize(apiData))
      : [];
  }
}
