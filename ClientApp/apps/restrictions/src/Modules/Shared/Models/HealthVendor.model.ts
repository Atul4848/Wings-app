import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPIHealthVendor } from '../Interfaces';
import { HealthVendorContactModel } from './HealthVendorContact.model';
import { AUTHORIZATION_LEVEL } from '../Enums';

@modelProtection
export class HealthVendorModel extends CoreModel implements ISelectOption {
  id: number = 0;
  authorizationLevel: SettingsTypeModel;
  vendorLevelEntityId: number = null;
  vendorLevelEntityCode: string = '';
  vendorLevelEntity: IdNameCodeModel;
  surveyLink: string = '';
  healthVendorContacts: HealthVendorContactModel[] = [];

  constructor(data?: Partial<HealthVendorModel>) {
    super(data);
    Object.assign(this, data);
    this.healthVendorContacts = data?.healthVendorContacts?.map(a => new HealthVendorContactModel(a)) || [];
  }

  static deserialize(apiData: IAPIHealthVendor): HealthVendorModel {
    if (!apiData) {
      return new HealthVendorModel();
    }
    const data: Partial<HealthVendorModel> = {
      ...apiData,
      id: apiData.healthVendorId || apiData.id,
      authorizationLevel: SettingsTypeModel.deserialize({
        ...apiData.authorizationLevel,
        id: apiData.authorizationLevel?.authorizationLevelId,
      }),
      vendorLevelEntity: this.getVendorLevelEntity(apiData),
      healthVendorContacts: HealthVendorContactModel.deserializeList(apiData.healthVendorContacts),
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new HealthVendorModel(data);
  }

  private static getVendorLevelEntity(apiData: IAPIHealthVendor): IdNameCodeModel {
    const { authorizationLevel } = apiData;
    let vendorLevelEntity: IdNameCodeModel;
    switch (authorizationLevel.name) {
      case AUTHORIZATION_LEVEL.COUNTRY:
        vendorLevelEntity = IdNameCodeModel.deserialize({
          ...authorizationLevel?.country,
          id: authorizationLevel?.country?.countryId,
          name: authorizationLevel.country?.name,
          code: authorizationLevel.country?.code,
        });
        break;
      case AUTHORIZATION_LEVEL.AIRPORT:
        vendorLevelEntity = IdNameCodeModel.deserialize({
          ...authorizationLevel?.airport,
          id: authorizationLevel?.airport?.airportId,
          name: authorizationLevel.airport?.name,
          code: authorizationLevel.airport?.code,
        });
        break;
      case AUTHORIZATION_LEVEL.STATE:
        vendorLevelEntity = IdNameCodeModel.deserialize({
          ...authorizationLevel?.state,
          id: authorizationLevel?.state?.stateId,
          name: authorizationLevel.state?.name,
          code: authorizationLevel.state?.code,
        });
        break;
    }
    return vendorLevelEntity;
  }

  public serialize(): IAPIHealthVendor {
    return {
      id: this.id,
      name: this.name,
      sourceTypeId: this.sourceType?.id,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      authorizationLevelId: this.authorizationLevel.id,
      vendorLevelEntityId: this.vendorLevelEntityId || 0,
      vendorLevelEntityCode: this.vendorLevelEntityCode,
      surveyLink: this.surveyLink,
      healthVendorContacts: this.healthVendorContacts.map(x => x.serialize()),
    };
  }

  static deserializeList(apiDataList: IAPIHealthVendor[]): HealthVendorModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIHealthVendor) => HealthVendorModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
