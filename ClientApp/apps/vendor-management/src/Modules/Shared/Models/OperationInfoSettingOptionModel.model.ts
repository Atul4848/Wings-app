import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationModel } from './VendorLocation.model';

@modelProtection
export class OperationInfoSettingOptionModel extends CoreModel implements ISelectOption {
  id: number;
  userId?: string;
  operationalEssentialId: number = 0;
  operationTypeId: number = 0;
  vendorLocationId: number = 0;
  paymentOptionsId: number = 0;
  creditAvailableId: number = 0;
  mainServicesOfferedId: number = 0;
  vendorLocation?: VendorLocationModel = new VendorLocationModel();
  operationType?: SettingBaseModel = new SettingBaseModel();
  paymentOptions?: SettingBaseModel = new SettingBaseModel();
  creditAvailable?: SettingBaseModel = new SettingBaseModel();
  mainServicesOffered?: SettingBaseModel = new SettingBaseModel();

  constructor(data?: Partial<OperationInfoSettingOptionModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: OperationInfoSettingOptionModel): OperationInfoSettingOptionModel {
    if (!apiData) {
      return new OperationInfoSettingOptionModel();
    }
    const data: Partial<OperationInfoSettingOptionModel> = {
      ...apiData,
      id: apiData.id,
      operationalEssentialId: apiData.operationalEssentialId,
      vendorLocation: VendorLocationModel.deserialize({
        ...apiData.vendorLocation,
        id: apiData.vendorLocation?.vendorLocationId
      }),
      operationType: SettingBaseModel.deserialize(apiData?.operationType),
      paymentOptions: SettingBaseModel.deserialize(apiData?.paymentOptions),
      creditAvailable: SettingBaseModel.deserialize(apiData?.creditAvailable),
      mainServicesOffered: SettingBaseModel.deserialize(apiData?.mainServicesOffered),
    };
    return new OperationInfoSettingOptionModel(data);
  }

  static deserializeList(apiDataList: OperationInfoSettingOptionModel[]): OperationInfoSettingOptionModel[] {
    return apiDataList ? apiDataList?.map((apiData: any) => OperationInfoSettingOptionModel.deserialize(apiData)) : [];
  }

  public serialize() {
    return {
      userId: this.userId || '',
      id: 0,
      operationTypeId: this.operationType?.id,
      vendorLocationId: this.vendorLocation?.id,
    };
  }

  public get label(): string {
    if (this.vendorLocation?.name) {
      const code = this.vendorLocation.airportReference?.getDisplayCode()
        ? `(${this.vendorLocation.airportReference?.getDisplayCode()})`
        : this.vendorLocation.vendorLocationCityReferenceModel?.cityReference?.name
          ? `(${this.vendorLocation.vendorLocationCityReferenceModel.cityReference?.code ||
          this.vendorLocation.vendorLocationCityReferenceModel.cityReference?.name})`
          : '';
      return `${this?.vendorLocation?.name} ${code}`;
    } else if (this.operationType?.label) {
      return this.operationType.label;
    } else if (this.paymentOptions?.label) {
      return this.paymentOptions.label;
    } else if (this.creditAvailable?.label) {
      return this.creditAvailable.label;
    } else if (this.mainServicesOffered?.label) {
      return this.mainServicesOffered.label;
    }
    return '';
  }

  public get value(): string {
    if (this.vendorLocation?.value) {
      return this.vendorLocation.value;
    } else if (this.operationType?.value) {
      return this.operationType.value;
    } else if (this.paymentOptions?.value) {
      return this.paymentOptions.value;
    } else if (this.creditAvailable?.value) {
      return this.creditAvailable.value;
    } else if (this.mainServicesOffered?.value) {
      return this.mainServicesOffered.value;
    }
    return '';
  }
}
