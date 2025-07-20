import { CountryModel, StateModel } from '../Models';
import { IAPIMetro, IAPIMetroRequest } from '../Interfaces';
import { BaseCityModel } from './BaseCity.model';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  modelProtection,
} from '@wings-shared/core';

@modelProtection
export class MetroModel extends CoreModel implements ISelectOption {
  code: string;
  country: CountryModel;
  state: StateModel;
  city: BaseCityModel;

  constructor(data?: Partial<MetroModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new CountryModel(data?.country);
    this.state = new StateModel(data?.state);
    this.city = new BaseCityModel(data?.city);
  }

  static deserialize(apiMetro: IAPIMetro): MetroModel {
    if (!apiMetro) {
      return new MetroModel();
    }
    const data: Partial<MetroModel> = {
      ...apiMetro,
      ...CoreModel.deserializeAuditFields(apiMetro),
      country: CountryModel.deserialize(apiMetro.country),
      state: StateModel.deserialize(apiMetro.state),
      city: BaseCityModel.deserialize(apiMetro.principalCity),
      status: StatusTypeModel.deserialize(apiMetro.status),
      accessLevel: AccessLevelModel.deserialize(apiMetro.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiMetro.sourceType),
    };
    return new MetroModel(data);
  }

  public serialize(): IAPIMetroRequest {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      countryId: Utilities.getNumberOrNullValue(this.country.id),
      stateId: this.state?.id,
      principalCityId: Utilities.getNumberOrNullValue(this.city?.id),
      statusId: Utilities.getNumberOrNullValue(this.status.value),
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
    };
  }

  static deserializeList(apiDataList: IAPIMetro[]): MetroModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIMetro) => MetroModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
