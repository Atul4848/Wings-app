import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorManagmentModel } from './VendorManagment.model';

@modelProtection
export class VendorOnBoardTrackingModel extends CoreModel implements ISelectOption {
  id: number = 0;
  userId: string = '';
  vendor: VendorManagmentModel = new VendorManagmentModel();
  vendorId: number = 0;
  tempLocationId: string = '';
  locationUniqueCode: string = '';
  slideNo: string = '';
  approvalRequestedDate: Date = new Date();
  status: SettingBaseModel = new SettingBaseModel();
  
  constructor(data?: Partial<VendorOnBoardTrackingModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: VendorOnBoardTrackingModel): VendorOnBoardTrackingModel {
    if (!apiData) {
      return new VendorOnBoardTrackingModel();
    }
    const data: Partial<VendorOnBoardTrackingModel> = {
      ...apiData,
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
    };
    return new VendorOnBoardTrackingModel(data);
  }

  static deserializeList(apiDataList: VendorOnBoardTrackingModel[]): VendorOnBoardTrackingModel[] {
    return apiDataList ? apiDataList.map(apiData => VendorOnBoardTrackingModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.vendor?.name || '';
  }

  public get value(): string | number {
    return this.id;
  }
}
