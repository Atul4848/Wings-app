import { CoreModel, getYesNoNullToBoolean, modelProtection } from '@wings-shared/core';
import { IQuarantineOrImmigrationInfo } from '../Interfaces';
@modelProtection
export class QuarantineOrImmigrationInfoModel extends CoreModel {
  agricultureAvailable: boolean;
  agricultureInstructions: string;
  immigrationAvailable: boolean;
  immigrationInstructions: string;

  constructor(data?: Partial<QuarantineOrImmigrationInfoModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IQuarantineOrImmigrationInfo): QuarantineOrImmigrationInfoModel {
    if (!apiData) {
      return new QuarantineOrImmigrationInfoModel();
    }
    const data: Partial<QuarantineOrImmigrationInfoModel> = {
      ...apiData,
      id: apiData.quarantineOrImmigrationInformationId || apiData.id,
      agricultureAvailable: apiData.agricultureOrQuarantineAvailable,
      agricultureInstructions: apiData.agricultureOrQuarantineInstructions,
      immigrationAvailable: apiData.immigrationAvailableAtAirport,
    };
    return new QuarantineOrImmigrationInfoModel(data);
  }

  static deserializeList(apiDataList: IQuarantineOrImmigrationInfo[]): QuarantineOrImmigrationInfoModel[] {
    return apiDataList ? apiDataList.map(apiData => QuarantineOrImmigrationInfoModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IQuarantineOrImmigrationInfo {
    return {
      id: this.id || 0,
      agricultureOrQuarantineAvailable: getYesNoNullToBoolean(this.agricultureAvailable),
      agricultureOrQuarantineInstructions: this.agricultureInstructions,
      immigrationAvailableAtAirport: getYesNoNullToBoolean(this.immigrationAvailable),
      immigrationInstructions: this.immigrationInstructions,
    };
  }
}
