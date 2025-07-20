import { IAPIFuelResponse } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class FuelModel {
  id: string = '';
  uwaCustomerId: number = 0;
  createdDate: string = '';
  archived: boolean = false;
  createdBy: string = '';
  customerName: string = '';
  updatedBy: string = '';
  updatedDate: string = '';
  wfsCustomerId: number = 0;
  
  constructor(data?: Partial<FuelModel>) {
    Object.assign(this, data);
  }

  static deserialize(fuel: IAPIFuelResponse): FuelModel {
    if (!fuel) {
      return new FuelModel();
    }

    const data: Partial<FuelModel> = {
      id: fuel.Id,
      uwaCustomerId: fuel.UWACustomerId,
      createdDate: fuel.CreatedDate,
      archived: fuel.Archived,
      createdBy: fuel.CreatedBy,
      customerName: fuel.CustomerName,
      updatedBy: fuel.UpdatedBy,
      updatedDate: fuel.UpdatedDate,
      wfsCustomerId: fuel.WFSCustomerId,
    };

    return new FuelModel(data);
  }

  static deserializeList(fuel: IAPIFuelResponse[]): FuelModel[] {
    return fuel
      ? fuel
        .map((fuels: IAPIFuelResponse) =>
          FuelModel.deserialize(fuels))
      : [];
  }
}