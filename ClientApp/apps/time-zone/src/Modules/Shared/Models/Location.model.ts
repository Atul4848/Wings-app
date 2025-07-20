import { AccessLevelModel, CoreModel, ISelectOption, SourceTypeModel, modelProtection } from '@wings-shared/core';
import { IAPILocation } from './../Interfaces';

@modelProtection
export class LocationModel extends CoreModel implements ISelectOption {
  locationPk: number = null;
  locationId: number = null;
  state?: string = '';
  year: number = null;
  regionId: number = null;
  regionName: string = '';
  countryId: number = null;
  countryName: string = '';
  timeZoneId?: number = null;

  constructor(data?: Partial<LocationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiLocation: IAPILocation): LocationModel {
    if (!apiLocation) {
      return new LocationModel();
    }

    const data: Partial<LocationModel> = {
      ...CoreModel.deserializeAuditFields(apiLocation),
      locationPk: apiLocation.locationPk,
      locationId: apiLocation.locationId,
      name: apiLocation.name,
      id: apiLocation.locationId,
      state: apiLocation.state,
      year: apiLocation.year,
      regionId: apiLocation.regionId,
      regionName: apiLocation.regionName,
      countryId: apiLocation.countryId,
      countryName: apiLocation.countryName,
      timeZoneId: apiLocation.timeZoneId,
      statusId: apiLocation.statusId,
      accessLevel: AccessLevelModel.deserialize(apiLocation.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiLocation.sourceType),
    };

    return new LocationModel(data);
  }

  static deserializeList(apiPersonList: IAPILocation[]): LocationModel[] {
    return apiPersonList ? apiPersonList.map((apiPerson: IAPILocation) => LocationModel.deserialize(apiPerson)) : [];
  }

  // Need for AutoComplete
  public get label(): string {
    return this.name;
  }
  public get value(): string | number {
    return this.locationId;
  }
}
