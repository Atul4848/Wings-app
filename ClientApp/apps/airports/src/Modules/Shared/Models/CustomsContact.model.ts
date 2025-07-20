import { CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirportCustomsContact, IAPIAirportCustomsContactRequest } from '../Interfaces';

export class CustomsContactModel extends CoreModel {
  airportId: number;
  preferred: boolean;
  contactName: string;
  contactValue: string;
  contactNotes: string;
  customsContactType: SettingsTypeModel;
  customsContactAddressType: SettingsTypeModel;

  constructor(data?: Partial<CustomsContactModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportCustomsContact): CustomsContactModel {
    if (!apiData) {
      return new CustomsContactModel();
    }
    const data: Partial<CustomsContactModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.customsContactId || apiData.id,
      customsContactType: new SettingsTypeModel({
        ...apiData.customsContactType,
        id: apiData.customsContactType?.customsContactTypeId || apiData.customsContactType?.id,
      }),
      customsContactAddressType: new SettingsTypeModel({
        ...apiData.customsContactAddressType,
        id: apiData.customsContactAddressType?.customsContactAddressTypeId || apiData.customsContactAddressType?.id,
      }),
    };
    return new CustomsContactModel(data);
  }

  static deserializeList(apiDataList: IAPIAirportCustomsContact[]): CustomsContactModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomsContactModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IAPIAirportCustomsContactRequest {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      preferred: this.preferred,
      contactName: this.contactName,
      contactValue: this.contactValue,
      contactNotes: this.contactNotes,
      customsContactTypeId: this.customsContactType?.id,
      customsContactAddressTypeId: this.customsContactAddressType?.id,
      statusId: this.status?.id,
    };
  }
}
