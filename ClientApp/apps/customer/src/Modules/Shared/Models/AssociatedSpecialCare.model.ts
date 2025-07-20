import { CoreModel, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAssociatedSpecialCare, IAssociatedSpecialCareRequest } from '../Interfaces';
import { CustomerRefModel, UserRefModel } from '@wings/shared';

export class AssociatedSpecialCareModel extends CoreModel {
  customer: CustomerRefModel;
  person: UserRefModel;
  specialCareType: SettingsTypeModel;
  specialCareTypeLevel: SettingsTypeModel;
  specialCareTypeEntity: IdNameCodeModel;

  constructor(data?: Partial<AssociatedSpecialCareModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAssociatedSpecialCare): AssociatedSpecialCareModel {
    if (!apiData) {
      return new AssociatedSpecialCareModel();
    }
    const data: Partial<AssociatedSpecialCareModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.associatedSpecialCareId || apiData.id,
      customer: CustomerRefModel.deserialize(apiData.customer),
      person: UserRefModel.deserialize(apiData.person),
      specialCareType: new SettingsTypeModel({
        ...apiData.specialCareType,
        id: apiData.specialCareType?.specialCareTypeId || apiData.specialCareType?.id,
      }),
      specialCareTypeLevel: new SettingsTypeModel({
        ...apiData.specialCareTypeLevel,
        id: apiData.specialCareTypeLevel?.specialCareTypeLevelId || apiData.specialCareTypeLevel?.id,
      }),
      specialCareTypeEntity: new IdNameCodeModel({
        id: apiData.specialCareTypeEntityId,
        name: apiData.specialCareTypeEntityName,
        code: apiData.specialCareTypeEntityCode,
      }),
    };
    return new AssociatedSpecialCareModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedSpecialCare[]): AssociatedSpecialCareModel[] {
    return apiDataList ? apiDataList.map(apiData => AssociatedSpecialCareModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(partyId: number): IAssociatedSpecialCareRequest {
    return {
      partyId,
      id: this.id,
      customerName: this.customer?.name,
      customerNumber: this.customer?.number,
      customerStartDate: this.customer?.startDate,
      customerEndDate: this.customer?.endDate,
      specialCareTypeId: this.specialCareType?.id,
      personId: this.person?.id || 0,
      personGuid: this.person.guid,
      personFirstName: this.person.firstName,
      personLastName: this.person.lastName,
      personEmail: this.person.email,
      specialCareTypeLevelId: this.specialCareTypeLevel?.id,
      specialCareTypeEntityId: this.specialCareTypeEntity?.id,
      specialCareTypeEntityName: this.specialCareTypeEntity?.name,
      specialCareTypeEntityCode: this.specialCareTypeEntity?.code,
      ...this._serialize(),
    };
  }
}
