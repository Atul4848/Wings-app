import { CoreModel, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationModel } from './VendorLocation.model';

@modelProtection
export class VendorLocationPhotosModel extends CoreModel {
  userId?: string = '';
  id: number = 0;
  photoUri: string = '';
  status: SettingBaseModel = new SettingBaseModel();
  statusId: number = 0;
  fileName: string = '';
  vendorLocation: VendorLocationModel = new VendorLocationModel();
  vendorLocationId: number = 0;

  constructor(data?: Partial<VendorLocationPhotosModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: VendorLocationPhotosModel): VendorLocationPhotosModel {
    if (!apiData) {
      return new VendorLocationPhotosModel();
    }
    const data: Partial<VendorLocationPhotosModel> = {
      ...apiData,
      vendorLocation: apiData.vendorLocation ? VendorLocationModel.deserialize(apiData.vendorLocation) : null,
      status: SettingBaseModel.deserialize(apiData.status),
    };
    return new VendorLocationPhotosModel(data);
  }

  public serialize() {
    return {
      userId: this.userId || '',
      id: this.id,
      photoUri: this.photoUri,
      fileName: this.fileName || 'Unknown',
      statusId: this.statusId ? this.statusId : this.status.id,
      vendorLocationId: this.vendorLocationId ? this.vendorLocationId : this.vendorLocation.id,
    };
  }

  static deserializeList(apiDataList: VendorLocationPhotosModel[]): VendorLocationPhotosModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => VendorLocationPhotosModel.deserialize(apiData)) : [];
  }
}
