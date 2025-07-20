import { IAPIIsland } from '../Interfaces';
import { CountryModel } from './index';
import { StateModel } from './State.model';
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
export class IslandModel extends CoreModel implements ISelectOption {
  country: CountryModel;
  state: StateModel;

  constructor(data?: Partial<IslandModel>) {
    super(data);
    Object.assign(this, data);
    this.country = data?.country?.id ? new CountryModel(data?.country) : null;
    this.state = data?.state?.id ? new StateModel(data?.state) : null;
  }

  static deserialize(apiIsland: IAPIIsland): IslandModel {
    if (!apiIsland) {
      return new IslandModel();
    }
    const data: Partial<IslandModel> = {
      ...CoreModel.deserializeAuditFields(apiIsland),
      id: apiIsland.islandId || apiIsland.id,
      name: apiIsland.name,
      country: apiIsland.countryId
        ? new CountryModel({
          commonName: apiIsland.countryName,
          id: apiIsland.countryId,
          isO2Code: apiIsland.countryCode,
        })
        : CountryModel.deserialize({ ...apiIsland.country, commonName: apiIsland.country?.countryName }),
      state: apiIsland.stateId
        ? new StateModel({
          id: apiIsland.stateId,
          commonName: apiIsland.stateName,
          isoCode: apiIsland.stateCode,
        })
        : StateModel.deserialize({
          ...apiIsland.state,
          code: apiIsland.state?.code,
          countryId: apiIsland.country?.countryId,
          isoCode: apiIsland.state?.code,
        }),
      status: StatusTypeModel.deserialize(apiIsland.status),
      accessLevel: AccessLevelModel.deserialize(apiIsland.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiIsland.sourceType),
    };
    return new IslandModel(data);
  }

  public serialize(): IAPIIsland {
    return {
      id: this.id,
      name: this.name,
      countryId: Utilities.getNumberOrNullValue(this.country.id),
      stateId: Utilities.getNumberOrNullValue(this.state?.id),
      statusId: Utilities.getNumberOrNullValue(this.status?.value),
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: Utilities.getNumberOrNullValue(this.sourceType?.id),
    };
  }

  static deserializeList(apiDataList: IAPIIsland[]): IslandModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIIsland) => IslandModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
