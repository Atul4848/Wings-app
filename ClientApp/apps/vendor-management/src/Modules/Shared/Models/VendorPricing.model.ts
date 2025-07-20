import { CoreModel, modelProtection } from '@wings-shared/core'
import { StatusBaseModel } from './StatusBase.model';
import { IAPIVMSVendorComparison } from '../Interfaces';
import { Airports } from './Airports.model';
@modelProtection
export class VendorPricingModel extends CoreModel {
  code: string;
  name: string;
  vendorStatus: StatusBaseModel;
  vendorStatusId: string;
  userId:string='';
  constructor(data?: Partial<VendorPricingModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIVMSVendorComparison): VendorPricingModel {
    if (!apiData) {
      return new VendorPricingModel();
    }
    const data: Partial<VendorPricingModel> = {
      ...apiData,
      vendorStatus: StatusBaseModel.deserialize(apiData.vendorStatus)
    };
    return new VendorPricingModel(data);
  }

  static deserializeList(apiDataList: IAPIVMSVendorComparison[]): VendorPricingModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => VendorPricingModel.deserialize(apiData)) : [];
  }
}