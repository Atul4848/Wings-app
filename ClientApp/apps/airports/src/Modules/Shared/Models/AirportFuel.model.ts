import { CoreModel, EntityMapModel, SettingsTypeModel, modelProtection } from '@wings-shared/core';
import { IAPIAiportFuel, IAPIAiportFuelRequest } from '../Interfaces';

@modelProtection
export class AirportFuelModel extends CoreModel {
  id:number;
  fuelingFacilities: string = '';
  fuelingHours: string = '';
  appliedFuelTypes: EntityMapModel[] = [];
  appliedOilTypes: EntityMapModel[] = [];

  constructor(data?: Partial<AirportFuelModel>) {
    super(data);
    Object.assign(this, data);
    this.appliedFuelTypes = data?.appliedFuelTypes?.map(fuelType => new EntityMapModel(fuelType));
    this.appliedOilTypes = data?.appliedOilTypes?.map(oilType => new EntityMapModel(oilType));
  }

  static deserialize(apiData: IAPIAiportFuel): AirportFuelModel {
    if (!apiData) {
      return new AirportFuelModel();
    }
    const data: Partial<AirportFuelModel> = {
      ...apiData,
      id: apiData.fuelId || apiData.id,
      appliedFuelTypes: apiData.appliedFuelTypes?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.fuelType?.fuelTypeId || entity.fuelType.id,
            name: entity.fuelType?.name,
          })
      ),
      appliedOilTypes: apiData.appliedOilTypes?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.oilType?.oilTypeId || entity.oilType?.id,
            name: entity.oilType?.name,
          })
      ),
    };
    return new AirportFuelModel(data);
  }

  public serialize(): IAPIAiportFuelRequest {
    return {
      id: this.id,
      fuelingFacilities: this.fuelingFacilities,
      fuelingHours: this.fuelingHours,
      appliedFuelTypes: this.appliedFuelTypes?.map(entity => {
        return {
          id: entity.id,
          fuelTypeId: entity.entityId,
        };
      }),
      appliedOilTypes: this.appliedOilTypes?.map(entity => {
        return {
          id: entity.id,
          oilTypeId: entity.entityId,
        };
      }),
    };
  }
}
