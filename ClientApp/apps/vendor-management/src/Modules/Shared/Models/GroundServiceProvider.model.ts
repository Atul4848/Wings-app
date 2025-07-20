import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import {
  IAPIResponseVendorLocationHours,
} from '../Interfaces/Response/API-Response-VendorLocation';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationModel } from './VendorLocation.model';
import { OperationInfoSettingOptionModel } from './OperationInfoSettingOptionModel.model';

@modelProtection
export class GroundServiceProviderModel extends CoreModel implements ISelectOption {
  id: number = 0;
  vendorLocation: VendorLocationModel;
  appliedVendorLocation: VendorLocationModel;
  otherName: string;
  status: SettingBaseModel = new SettingBaseModel();
  groundServiceProviderOperationType: OperationInfoSettingOptionModel[] = [];

  constructor(data?: Partial<GroundServiceProviderModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: GroundServiceProviderModel): GroundServiceProviderModel {
    if (!apiData) {
      return new GroundServiceProviderModel();
    }
    const data: Partial<GroundServiceProviderModel> = {
      ...apiData,
      vendorLocation: VendorLocationModel.deserialize(apiData.vendorLocation),
      appliedVendorLocation:
        apiData.appliedVendorLocation !== null
          ? VendorLocationModel.deserialize({
            ...apiData.appliedVendorLocation,
            id: apiData.appliedVendorLocation?.vendorLocationId,
            name: apiData.appliedVendorLocation?.name ?? 'Other',
          })
          : VendorLocationModel.deserialize({
            id: 999999,
            name: 'Other',
            code: null,
            airportReference: null,
          }),
      otherName: apiData.otherName,
      status: SettingBaseModel.deserialize(apiData.status),
      groundServiceProviderOperationType: OperationInfoSettingOptionModel.deserializeList(
        apiData.groundServiceProviderOperationType
      ),
    };
    return new GroundServiceProviderModel(data);
  }

  static deserializeList(apiDataList: IAPIResponseVendorLocationHours[]): GroundServiceProviderModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => GroundServiceProviderModel.deserialize(apiData)) : [];
  }

  public serialize(locationId: number) {
    return {
      userId: this.userId || '',
      id: this.id || 0,
      vendorLocationId: locationId,
      appliedVendorLocationId: this.appliedVendorLocation.id !== 999999 ? this.appliedVendorLocation.id : null,
      otherName: this.otherName || null,
      statusId: this.status.id,
      groundServiceProviderOperationType: this.groundServiceProviderOperationType.map(item => item.serialize()),
    };
  }

  // required in auto complete
  public get label(): string {
    return `${this.id}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
