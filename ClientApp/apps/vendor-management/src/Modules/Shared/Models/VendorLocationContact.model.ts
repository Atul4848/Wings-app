import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { ContactMasterModel } from './ContactMaster.model';
import { VendorLocationModel } from './VendorLocation.model';
import { IAPIRequestVendorLocationContact } from '../Interfaces/Request/API-Request-VendorLocationContact.interface';
import { IAPIResponseVendorLocationContact } from '../Interfaces/Response/API-Response-VendorLocationContact';
import { VendorManagmentModel } from './VendorManagment.model';
import { OnBoardInvitationModel } from './OnBoardInvitation.model';

@modelProtection
export class VendorLocationContactModel extends CoreModel implements ISelectOption {
  id: number =0;
  contact: ContactMasterModel = new ContactMasterModel();
  status: SettingBaseModel = new SettingBaseModel();
  vendorLocation: VendorLocationModel;
  vendorId: number = 0;
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

  public serialize(vendorLocationIds: number[], ids: number[], vendorId: number): IAPIRequestVendorLocationContact {
    return {
      ids: ids,
      vendorLocationIds: vendorLocationIds,
      contactId: this.contact.id,
      contactUsegeTypeId: this.contactUsegeType.id,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
      userId: this.userId,
      vendorId: vendorId,
      vendorOnBoardInvitationRequest: {
        userId: this.vendorOnBoardInvitation?.userId || '',
        id: this.vendorOnBoardInvitation?.id || 0,
        airportReferenceRequest: this.vendorOnBoardInvitation?.airportReference,
        isInviteEmailSent: this.vendorOnBoardInvitation?.isInviteEmailSent || false,
        comment: this.vendorOnBoardInvitation?.comment || '',
      },
    };
  }

  static deserialize(apiData: IAPIResponseVendorLocationContact): VendorLocationContactModel {
    if (!apiData) {
      return new VendorLocationContactModel();
    }
    const data: Partial<VendorLocationContactModel> = {
      ...apiData,
      contact: ContactMasterModel.deserialize(apiData.contact),
      vendorLocation: VendorLocationModel.deserialize({
        ...apiData.vendorLocation,
        id: apiData.vendorLocation?.vendorLocationId,
      }),
      contactUsegeType: SettingBaseModel.deserialize(apiData.contactUsegeType),
      accessLevel: SettingBaseModel.deserialize(apiData.accessLevel),
      status: SettingBaseModel.deserialize(apiData.status),
      vendorOnBoardInvitation: OnBoardInvitationModel.deserialize(apiData?.vendorOnBoardInvitation),
    };
    return new VendorLocationContactModel(data);
  }

  static deserializeList(apiDataList: IAPIResponseVendorLocationContact[]): VendorLocationContactModel[] {
    return apiDataList ? apiDataList.map(apiData => VendorLocationContactModel.deserialize(apiData)) : [];
  }
}
