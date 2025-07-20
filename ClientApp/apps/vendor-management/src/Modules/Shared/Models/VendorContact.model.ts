import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIVMSVendorContactComparison } from '../Interfaces';
import { SettingBaseModel } from './SettingBase.model';
import { ContactMasterModel } from './ContactMaster.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { IAPIRequestVendorContact } from '../Interfaces/Request/API-Request-VendorContact.interface';
import { IAPIResponseVendorContact } from '../Interfaces/Response/API-Response-VendorContact';
import { OnBoardInvitationModel } from './OnBoardInvitation.model';

@modelProtection
export class VendorContact extends CoreModel implements ISelectOption {
  id: number = 0;
  contact: ContactMasterModel = new ContactMasterModel();
  status: SettingBaseModel = new SettingBaseModel();
  vendorId: number;
  vendor: VendorManagmentModel;
  contactUsegeType: SettingBaseModel = new SettingBaseModel();
  accessLevel: SettingBaseModel = new SettingBaseModel();
  vendorOnBoardInvitation?: OnBoardInvitationModel = new OnBoardInvitationModel();
  constructor(data?: Partial<ContactMasterModel>) {
    super(data);
    Object.assign(this, data);
  }
  // required in auto complete
  public get label(): string {
    return ContactMasterModel.getDisplayContactLabel(this.contact);
  }

  public get value(): string | number {
    return this.id;
  }

  public serialize(): IAPIRequestVendorContact {
    return {
      id: this.id || 0,
      vendorId: this.vendor.id,
      contactId: this.contact.id,
      contactUsegeTypeId: this.contactUsegeType.id,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
      userId: this.userId,
      vendorOnBoardInvitationRequest: this.vendorOnBoardInvitation?.isInviteEmailSent  ? {
        userId: this.vendorOnBoardInvitation?.userId || '',
        id: this.vendorOnBoardInvitation?.id || 0,
        airportReferenceRequest: this.vendorOnBoardInvitation?.airportReference,
        isInviteEmailSent: this.vendorOnBoardInvitation?.isInviteEmailSent || false,
        comment: this.vendorOnBoardInvitation?.comment || '',
      } : null,
    };
  }

  static deserialize(apiData: IAPIResponseVendorContact): VendorContact {
    if (!apiData) {
      return new VendorContact();
    }
    const data: Partial<VendorContact> = {
      ...apiData,
      contact: ContactMasterModel.deserialize(apiData.contact),
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      contactUsegeType: SettingBaseModel.deserialize(apiData.contactUsegeType),
      accessLevel: SettingBaseModel.deserialize(apiData.accessLevel),
      status: SettingBaseModel.deserialize(apiData.status),
    };
    return new VendorContact(data);
  }

  static deserializeList(apiDataList: IAPIResponseVendorContact[]): VendorContact[] {
    return apiDataList ? apiDataList.map(apiData => VendorContact.deserialize(apiData)) : [];
  }
}
