import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { StatusBaseModel } from './StatusBase.model';
import { VendorAddressModel } from './VendorAddress.model';
import { IAPIResponseVendor } from '../Interfaces/Response/API-Response-Vendor';
import { IAPIRequestVendor } from '../Interfaces/Request/API-Request-Vendor.interface';
@modelProtection
export class VendorManagmentModel extends CoreModel implements ISelectOption {
  code: string = '';
  name: string = '';
  vendorStatus: StatusBaseModel = new StatusBaseModel();
  vendorStatusId: number = 0;
  userId: string = '';
  commonName: string = '';
  legalCompanyName: string = '';
  is3rdPartyLocation: boolean = false;
  isInvitationPacketSend: boolean = false;
  id: number = 0;
  vendorStatusDetails: string= '';
  vendorAddress: VendorAddressModel = new VendorAddressModel();
  constructor(data?: Partial<VendorManagmentModel>) {
    super(data);
    Object.assign(this, data);
    const address = Array.isArray(data?.vendorAddress)
      ? data?.vendorAddress?.filter(
        element => {
          return element.addressType.id === 1
        }) : [];
    this.vendorAddress = data?.vendorAddress ? new VendorAddressModel(address[0]) : new VendorAddressModel();
    this.vendorStatus = data?.vendorStatus ? new StatusBaseModel(data.vendorStatus) : new StatusBaseModel();
  }

  static deserialize(apiData: IAPIResponseVendor): VendorManagmentModel {
    if (!apiData) {
      return new VendorManagmentModel();
    }

    const data: Partial<VendorManagmentModel> = {
      ...apiData,
      vendorStatus: StatusBaseModel.deserialize(apiData.vendorStatus)
    };
    return new VendorManagmentModel(data);
  }

  public serialize(isInvitationPacketSend: boolean): IAPIRequestVendor {
    return {
      id: this.id || 0,
      code: this.code,
      name: this.name,
      userId: this.userId,
      legalCompanyName: this.legalCompanyName?.trim() || null,
      vendorStatusId: this.vendorStatus.id,
      vendorStatus: this.vendorStatus,
      is3rdPartyLocation: Boolean(this.is3rdPartyLocation),
      vendorAddress: this.buildVendorAddress().addressLine1 ? this.buildVendorAddress() : null,
      isInvitationPacketSend: isInvitationPacketSend || null,
      vendorStatusDetails: this.vendorStatusDetails || null
    };
  }
  
  static deserializeList(apiDataList: IAPIResponseVendor[]): VendorManagmentModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => VendorManagmentModel.deserialize(apiData)) : [];
  }

  public buildVendorAddress = (): VendorAddressModel => {
    return new VendorAddressModel({
      id: this.vendorAddressId || 0,
      addressTypeId: 1,
      cityId: this.hqAddressCity.id,
      cityName: this.hqAddressCity.commonName,
      cityCode: this.hqAddressCity.cappsCode,
      stateId: this.hqAddressState?.id,
      stateName: this.hqAddressState?.commonName,
      stateCode: this.hqAddressState?.isoCode,
      countryId: this.hqAddressCountry.id,
      countryCode: this.hqAddressCountry.isO2Code,
      countryName: this.hqAddressCountry.commonName,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2 || null,
      zipCode: this.hqAddressZipCode||null,
    });
  };

  // required in auto complete
  public get label(): string {
    return `${this?.name} (${this?.code})`;
  }

  public get value(): string | number {
    return this.id;
  }
}
