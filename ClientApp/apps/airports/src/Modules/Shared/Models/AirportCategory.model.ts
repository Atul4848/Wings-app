import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportCategory } from '../Interfaces';
@modelProtection
export class AirportCategoryModel extends CoreModel {
  description: string = '';

  constructor(data?: Partial<AirportCategoryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportCategory): AirportCategoryModel {
    if (!apiData) {
      return new AirportCategoryModel();
    }
    return new AirportCategoryModel({ ...apiData, id: apiData?.airportCategoryId || apiData?.id });
  }

  static deserializeList(airportCategoryList: IAPIAirportCategory[]): AirportCategoryModel[] {
    return airportCategoryList
      ? airportCategoryList.map((apiData: IAPIAirportCategory) => AirportCategoryModel.deserialize({ ...apiData }))
      : [];
  }

  public serialize(): IAPIAirportCategory {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
