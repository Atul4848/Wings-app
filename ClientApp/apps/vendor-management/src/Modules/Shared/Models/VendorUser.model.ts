import { CoreModel, modelProtection } from '@wings-shared/core';
import { VendorManagmentModel } from './VendorManagment.model';
import { IAPIResponseVendorUser } from '../Interfaces/Response/API-Response-Vendor';
import { SettingBaseModel } from './SettingBase.model';
import { OperationInfoSettingOptionModel } from './OperationInfoSettingOptionModel.model';
import { UserGroupModel } from './UserGroup.model';

@modelProtection
export class VendorUserModel extends CoreModel {
  id: number = 0;
  vendorId: number = 0;
  username: string = '';
  phoneNo?: string = '';
  vendor?: VendorManagmentModel = new VendorManagmentModel();
  email: string = '';
  givenName: string = '';
  surName: string = '';
  userRole: UserGroupModel = null;
  status: SettingBaseModel = new SettingBaseModel();
  vendorUserLocation: OperationInfoSettingOptionModel[] = [];
  oktaUserId?: string = null;
  isOptedSms?: boolean = false;

  constructor(data?: Partial<VendorUserModel>) {
    super(data);
    Object.assign(this, data);
  }

  public serialize(
    id: number, vendorId: number, userRole: string, oktaUserId: string
  ): VendorUserModel {
    return {
      userId: '',
      id: id || 0,
      vendorId: vendorId,
      email: this.email,
      givenName: this.givenName,
      userName: this.username || this.email,
      phoneNo: this.phoneNo,
      surName: this.surName,
      userRole: userRole,
      statusId: this.status.id,
      vendorUserLocation: this.vendorUserLocation.map(data => ({
        userId: data.userId || '',
        id: data.id || 0,
        vendorLocationId: data?.vendorLocation?.id || data?.vendorLocation?.vendorLocationId || 0,
      })),
      oktaUserId: oktaUserId ? oktaUserId : 'tempOktaUserId',
      isOptedSms: this.isOptedSms
    };
  }

  static deserialize(apiData: IAPIResponseVendorUser): VendorUserModel {
    if (!apiData) {
      return new VendorUserModel();
    }
    const data: Partial<VendorUserModel> = {
      ...apiData,
      vendor: VendorManagmentModel.deserialize(apiData?.vendor),
      email: apiData.email,
      givenName: apiData.givenName,
      surName: apiData.surName,
      userRole: apiData.userRole
        ? UserGroupModel.deserialize({
          Id: '',
          Name: apiData.userRole,
        })
        : null,
      status: apiData.status.id ? SettingBaseModel.deserialize(apiData.status) : undefined,
      vendorUserLocation: OperationInfoSettingOptionModel.deserializeList(apiData.vendorUserLocation),
      isOptedSms: apiData.isOptedSms
    };
    return new VendorUserModel(data);
  }

  static deserializeList(apiDataList: IAPIResponseVendorUser[]): VendorUserModel[] {
    return apiDataList ? apiDataList.map(apiData => VendorUserModel.deserialize(apiData)) : [];
  }
}
