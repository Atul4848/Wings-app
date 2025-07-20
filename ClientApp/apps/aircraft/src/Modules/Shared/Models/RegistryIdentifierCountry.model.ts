import { CountryModel } from '@wings/shared';
import { IAPIRegistryIdentifierCountry } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  Utilities,
} from '@wings-shared/core';

@modelProtection
export class RegistryIdentifierCountryModel extends CoreModel implements ISelectOption {
  identifier: string = '';
  country: CountryModel;

  constructor(data?: Partial<RegistryIdentifierCountryModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new CountryModel(data?.country);
  }

  static deserialize(apiRegistryIdentifierCountry: IAPIRegistryIdentifierCountry): RegistryIdentifierCountryModel {
    if (!apiRegistryIdentifierCountry) {
      return new RegistryIdentifierCountryModel();
    }
    const data: Partial<RegistryIdentifierCountryModel> = {
      ...apiRegistryIdentifierCountry,
      name: apiRegistryIdentifierCountry.identifier,
      accessLevel: AccessLevelModel.deserialize(apiRegistryIdentifierCountry.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiRegistryIdentifierCountry.sourceType),
      country: new CountryModel({
        id: apiRegistryIdentifierCountry.countryId,
        isO2Code: apiRegistryIdentifierCountry.countryCode,
      }),
    };
    return new RegistryIdentifierCountryModel(data);
  }

  public serialize(): IAPIRegistryIdentifierCountry {
    return {
      id: this.id,
      identifier: this.name,
      countryId: Utilities.getNumberOrNullValue(this.country?.id),
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
      countryCode: this.country?.isO2Code,
    };
  }

  static deserializeList(apiDataList: IAPIRegistryIdentifierCountry[]): RegistryIdentifierCountryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRegistryIdentifierCountry) => RegistryIdentifierCountryModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
