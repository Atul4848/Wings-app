import { CoreModel, modelProtection } from '@wings-shared/core';
import { VendorLocationModel } from './VendorLocation.model';

@modelProtection
export class VendorUserLocationModel extends CoreModel {
  id: number = 0;
  vendorUserId: number = 0;
  vendorLocation:VendorLocationModel= new VendorLocationModel();
  
  constructor(data?: Partial<VendorUserLocationModel>) {
    super(data);
    Object.assign(this, data);
  }

  public get label(): string {
    return this.vendorLocation.label;
  }

  public get value(): string | number {
    return this.id;
  }
  static deserialize(apiData: VendorUserLocationModel): VendorUserLocationModel {
    if (!apiData) {
      return new VendorUserLocationModel();
    }
    const data: Partial<VendorUserLocationModel> = {
      ...apiData,
      vendorUserId: apiData.vendorUserId,
      vendorLocation: VendorLocationModel.deserialize(apiData?.vendorLocation),
    };
    return new VendorUserLocationModel(data);
  }
  
  static deserializeList(apiDataList: VendorUserLocationModel[]): VendorUserLocationModel[] {
    return apiDataList ? apiDataList.map((apiData) => VendorUserLocationModel.deserialize(apiData)) : [];
  }
  
}
