import { CountryModel, RegionModel, StateModel } from '@wings/shared';
import {
  AccessLevelModel,
  CoreModel,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
} from '@wings-shared/core';
import { IAPIAssociatedRegion, IAPIAssociatedRegionRequest } from './../Interfaces';

@modelProtection
export class AssociatedRegionModel extends CoreModel {
  region: RegionModel;
  country: CountryModel;
  state: StateModel;

  constructor(data?: Partial<AssociatedRegionModel>) {
    super(data);
    this.region = new RegionModel(data?.region);
    this.country = new CountryModel(data?.country);
    this.state = new StateModel(data?.state);
  }

  static deserialize(apiData: IAPIAssociatedRegion): AssociatedRegionModel {
    if (!apiData) {
      return new AssociatedRegionModel();
    }
    const data: Partial<AssociatedRegionModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id,
      region: RegionModel.deserialize(apiData.region),
      country: CountryModel.deserialize(apiData.country),
      state: StateModel.deserialize(apiData.state),
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new AssociatedRegionModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedRegion[]): AssociatedRegionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAssociatedRegion) => AssociatedRegionModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIAssociatedRegionRequest {
    return {
      id: this.id,
      regionId: this.region.id,
      countryId: isNaN(Number(this.country.id)) ? null : Number(this.country.id),
      stateId: Utilities.getNumberOrNullValue(this.state?.id),
      statusId: Utilities.getNumberOrNullValue(this.status?.value),
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
    };
  }
}
