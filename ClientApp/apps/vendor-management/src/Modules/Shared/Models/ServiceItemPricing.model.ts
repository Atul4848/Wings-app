import { CoreModel, StatusTypeModel, modelProtection } from '@wings-shared/core';
import { ServiceItemModel } from './ServiceItem.model';
import { HandlingFeeModel } from './HanglingFee.model';
import { ParameterModel } from './Parameter.model';
import { CurrencyModel } from './Currency.model';
import { UOMModel } from './uom.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { ServiceItemPricingLocationModel } from './ServiceItemPricingLocation.model';
import { IAPIVMSVendorComparison, IAPIVmsVendorStatusTable } from '../Interfaces';

@modelProtection
export class ServiceItemPricingModel extends CoreModel {
  public id: number = 0;
  public ServiceItemId: number = 0;
  public serviceItem: ServiceItemModel = new ServiceItemModel();
  public isCommissionable: boolean = false;
  public isDirectService: boolean = true;
  public thirdPartyVendorComment: string = '';
  public isVariablePricing: boolean = false;
  public handlingFeeId: number = 0;
  public handlingFee: HandlingFeeModel = new HandlingFeeModel();
  public priceDataUnavailable: boolean = false;
  public parameterId: number = 0;
  public parameter: ParameterModel = new ParameterModel();
  public lowerLimit: number = null;
  public upperLimit: number = null;
  public price: number = null;
  public currencyId: number = 0;
  public currency: CurrencyModel = new CurrencyModel();
  public unitId: number = 0;
  public uom: UOMModel = new UOMModel();
  public comment: string = '';
  public validFrom: Date = new Date();
  public validTo: Date = new Date();
  public status: StatusTypeModel = new StatusTypeModel();
  public statusId: number = 0;
  public vendorId: number = 0;
  public vendor: VendorManagmentModel = new VendorManagmentModel();
  public vendorLocation: ServiceItemPricingLocationModel[] = [];
  ServiceItemPricingLocations: number[] = [];
  public version:string='';

  constructor(data?: Partial<ServiceItemPricingModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: ServiceItemPricingModel): ServiceItemPricingModel {
    if (!apiData) {
      return new ServiceItemPricingModel();
    }
    const data: Partial<ServiceItemPricingModel> = {
      ...apiData,
      serviceItem: ServiceItemModel.deserialize(apiData.serviceItem),
      currency: CurrencyModel.deserialize(apiData.currency),
      handlingFee: HandlingFeeModel.deserialize(apiData.handlingFee),
      parameter: ParameterModel.deserialize(apiData.parameter),
      status: StatusTypeModel.deserialize(apiData.status as IAPIVmsVendorStatusTable),
      uom: UOMModel.deserialize(apiData.uom),
      vendor: VendorManagmentModel.deserialize(apiData.vendor as IAPIVMSVendorComparison),
      vendorLocation: ServiceItemPricingLocationModel.deserializeList(apiData.vendorLocation),
    };
    return new ServiceItemPricingModel(data);
  }

  public serialize(){
    return {
      id: this.id || 0,
      ServiceItemId: this.serviceItem.id,
      isCommissionable: this.isCommissionable,
      isDirectService: this.isDirectService,
      thirdPartyVendorComment: this.thirdPartyVendorComment,
      isVariablePricing: this.isVariablePricing,
      handlingFeeId: this.handlingFee.id,
      priceDataUnavailable: this.priceDataUnavailable,
      parameterId: this.parameter?.id,
      lowerLimit: this.lowerLimit || null,
      upperLimit: this.upperLimit || null,
      price: this.price || null,
      currencyId: this.currency?.id || null,
      unitId: this.uom?.id || null,
      uom: this.uom,
      userId: this.userId,
      comment: this.comment?.replace(/^\s*\s*$/, ''),
      validFrom: this.validFrom,
      validTo: this.validTo,
      statusId: this.status.id,
      vendorId: this.vendor.id,
      // serviceItemPricingLocations: this.vendorLocation.map(item=>item.id)
      serviceItemPricingLocations: Array.from(new Set(this.vendorLocation.map(item => item.id)))
    };
  }

  static deserializeList(apiDataList: ServiceItemPricingModel[]): ServiceItemPricingModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => ServiceItemPricingModel.deserialize(apiData)) : [];
  }
}
