import { AircraftModelMakeModel } from './index';
import { IAPIAircraftModel } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class AircraftModel extends CoreModel implements ISelectOption {
  id: number = 0;
  modelMakes: AircraftModelMakeModel[];

  constructor(data?: Partial<AircraftModel>) {
    super(data);
    Object.assign(this, data);
    this.modelMakes = data?.modelMakes?.map(x => new AircraftModelMakeModel(x)) || [];
  }

  static deserialize(apiData: IAPIAircraftModel): AircraftModel {
    if (!apiData) {
      return new AircraftModel();
    }
    const data: Partial<AircraftModel> = {
      ...apiData,
      id: apiData.modelId | apiData.id,
      modelMakes: apiData.modelMakes?.map(x =>
        AircraftModelMakeModel.deserialize({
          ...x,
          name: x.name,
          id: x.make.makeId,
          isLargeAircraft: x.isLargeAircraft,
        })
      ),
    };
    return new AircraftModel(data);
  }

  public serialize(): IAPIAircraftModel {
    return {
      id: this.id,
      name: this.name,
      modelMakes: this.modelMakes?.map(x => ({ id: x.id, isLargeAircraft: x.isLargeAircraft, makeId: x.make?.id })),
    };
  }

  static deserializeList(apiDataList: IAPIAircraftModel[]): AircraftModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIAircraftModel) => AircraftModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
