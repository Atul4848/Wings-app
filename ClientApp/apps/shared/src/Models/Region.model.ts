import { IAPIRegion, IAPIRegionRequest } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { CountryModel } from './index';

@modelProtection
export class RegionModel extends CoreModel implements ISelectOption {
  code: string = '';
  regionTypeName: string = '';
  regionType: SettingsTypeModel;
  countries: CountryModel[] = [];
  regionId: number = null;
  regionName: string = '';
  regionTypeId?: number = null;

  constructor(data?: Partial<RegionModel>) {
    super(data);
    Object.assign(this, data);
    this.regionType = new SettingsTypeModel(data?.regionType);
  }

  static deserialize(apiRegion: IAPIRegion): RegionModel {
    if (!apiRegion) {
      return new RegionModel();
    }
    const data: Partial<RegionModel> = {
      ...CoreModel.deserializeAuditFields(apiRegion),
      id: apiRegion.regionId || apiRegion.id,
      name: apiRegion.regionName || apiRegion.name,
      code: apiRegion.code,
      regionType: SettingsTypeModel.deserialize({
        id: apiRegion.regionType?.regionTypeId,
        name: apiRegion.regionType?.name,
      }),
      countries: CountryModel.deserializeList(apiRegion.countries),
      status: StatusTypeModel.deserialize(apiRegion.status),
      accessLevel: AccessLevelModel.deserialize(apiRegion.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiRegion.sourceType),
    };
    return new RegionModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIRegionRequest {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      regionTypeId: Utilities.getNumberOrNullValue(this.regionType?.id),
      statusId: Utilities.getNumberOrNullValue(this.status.value),
      accessLevelId: this.accessLevel.id,
      sourceTypeId: this.sourceType?.id,
    };
  }

  static deserializeList(regions: IAPIRegion[]): RegionModel[] {
    return regions ? regions.map((region: IAPIRegion) => RegionModel.deserialize(region)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
