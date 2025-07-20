import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIResponseOwnership } from '../Interfaces/Response/API-Response-Ownership';
import { IAPIRequestOwnership } from '../Interfaces/Request/API-Request-Ownership.interface';

@modelProtection
export class UltimateOwnershipModel extends CoreModel {
  id: number = 0;
  name: string;
  percentage: number;
  vendorId: number;
  vendorLocationId: number;
  isUBORefused: boolean = null;

  constructor(data?: Partial<UltimateOwnershipModel>) {
    super(data);
    Object.assign(this, data);
  }

  public serialize(vendorId: number, vendorLocationId: number): IAPIRequestOwnership {
    return {
      userId: this.userId,
      id: this.id || 0,
      name: this.name,
      percentage: this.percentage,
      vendorId: vendorId,
      ...(vendorLocationId ? { vendorLocationId: parseInt(String(vendorLocationId)) } : {}),
      isUBORefused: this.isUBORefused
    };
  }

  public serializeList(vendorId: number, vendorLocationId: number, data, isUBORefused) {
    return data.map(item => ({
      userId: item.userId || '',
      id: item.id,
      name: item.name,
      percentage: item.percentage,
      vendorId: parseInt(vendorId),
      ...(vendorLocationId ? { vendorLocationId: parseInt(String(vendorLocationId)) } : {}),
      isUBORefused: isUBORefused,
    }));
  }

  static deserialize(apiData: IAPIResponseOwnership): UltimateOwnershipModel {
    if (!apiData) {
      return new UltimateOwnershipModel();
    }
    const data: Partial<UltimateOwnershipModel> = {
      ...apiData,
      name: apiData.name,
      percentage: apiData.percentage,
      vendorId: apiData.vendorId,
      vendorLocationId: apiData.vendorLocationId,
      isUBORefused: apiData.isUBORefused
    };
    return new UltimateOwnershipModel(data);
  }

  static deserializeList(apiDataList: IAPIResponseOwnership[]): UltimateOwnershipModel[] {
    return apiDataList ? apiDataList.map(apiData => UltimateOwnershipModel.deserialize(apiData)) : [];
  }
}
