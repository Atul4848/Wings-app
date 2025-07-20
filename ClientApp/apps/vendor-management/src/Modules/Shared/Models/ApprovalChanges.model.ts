import { CoreModel, IBaseApiResponse, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { VendorLocationModel } from './VendorLocation.model';
import { ServiceItemModel } from './ServiceItem.model';
import { ServiceItemPricingModel } from './ServiceItemPricing.model';

@modelProtection
export class ApprovalChangesDataModel extends CoreModel {
  id: number = 0;
  approvalStatus: SettingBaseModel = new SettingBaseModel();
  comment: string = '';
  newValue: ServiceItemPricingModel = new ServiceItemPricingModel();
  oldValue: ServiceItemPricingModel = new ServiceItemPricingModel();
  serviceItem: ServiceItemModel = new ServiceItemModel();
  serviceItemPricingId: number = 0;
  vendor: VendorManagmentModel = new VendorManagmentModel();
  vendorLocation: VendorLocationModel = new VendorLocationModel();
  approvalStatusId: number = 0;

  constructor(data?: Partial<ApprovalChangesDataModel>) {
    super(data);
    Object.assign(this, data);
  }

  public serialize(id: number, statusId:number ):ApprovalChangesDataModel {
    return {

      userId: this.userId || '',
      id: id?id : this.id || 0,
      approvalStatusId:statusId,
      comment: this.comment,
    };
  }

  static deserialize(apiData: ApprovalChangesDataModel): ApprovalChangesDataModel {
    if (!apiData) {
      return new ApprovalChangesDataModel();
    }
    const data: Partial<ApprovalChangesDataModel> = {
      ...apiData,
      id: apiData.id,
      comment: apiData.comment,
      approvalStatus: SettingBaseModel.deserialize(apiData.approvalStatus),
      newValue: apiData.newValue,
      oldValue: apiData.oldValue,
      serviceItem: ServiceItemModel.deserialize(apiData.serviceItem),
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      vendorLocation: VendorLocationModel.deserialize(apiData.vendorLocation),
    };
    return new ApprovalChangesDataModel(data);
  }

  static deserializeList(apiData: ApprovalChangesDataModel[]): ApprovalChangesDataModel[] {
    return apiData ? apiData.map((data: ApprovalChangesDataModel) => ApprovalChangesDataModel.deserialize(data)) : [];
  }
}
