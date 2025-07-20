import { CoreModel, getYesNoNullToBoolean, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IReimbursableServicesProgramModel } from '../Interfaces';

@modelProtection
export class ReimbursableServicesProgramModel extends CoreModel {
  subscribedAirport: boolean;
  instructions: string;
  contact: SettingsTypeModel;

  constructor(data?: Partial<ReimbursableServicesProgramModel>) {
    super(data);
    Object.assign(this, data);
    this.contact = new SettingsTypeModel(data?.contact);
  }

  static deserialize(apiData: IReimbursableServicesProgramModel): ReimbursableServicesProgramModel {
    if (!apiData) {
      return new ReimbursableServicesProgramModel();
    }
    const data: Partial<ReimbursableServicesProgramModel> = {
      ...apiData,
      id: apiData.id,
      subscribedAirport: apiData.subscribedAirport,
      instructions: apiData.instructions,
      contact: SettingsTypeModel.deserialize({
        ...apiData.contact,
        id: apiData.contact?.customsContactId,
      }),
    };
    return new ReimbursableServicesProgramModel(data);
  }

  static deserializeList(apiDataList: IReimbursableServicesProgramModel[]): ReimbursableServicesProgramModel[] {
    return apiDataList ? apiDataList.map(apiData => ReimbursableServicesProgramModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IReimbursableServicesProgramModel {
    return {
      id: this.id || 0,
      subscribedAirport: getYesNoNullToBoolean(this.subscribedAirport),
      instructions: this.instructions,
      customsContactId: this.contact?.id,
    };
  }
}
