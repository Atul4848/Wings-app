import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIVMSVendorComparison } from '../Interfaces';
import { SettingBaseModel } from './SettingBase.model';
import { ContactMasterModel } from './ContactMaster.model';

@modelProtection
export class DirectoryAppliedContactModel extends CoreModel implements ISelectOption {
  id: number = 0;
  directoryCodeId: number = 0;
  contact: ContactMasterModel = new ContactMasterModel();
  appliedContactId: number = 0;

  constructor(data?: Partial<DirectoryAppliedContactModel>) {
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

  public serialize() {
    return {
      userId: '',
      id: this.id || 0,
      contactId: this.contact.id,
    };
  }

  static deserialize(apiData: IAPIVMSVendorComparison): DirectoryAppliedContactModel {
    if (!apiData) {
      return new DirectoryAppliedContactModel();
    }
    const data: Partial<DirectoryAppliedContactModel> = {
      ...apiData,
      contact: ContactMasterModel.deserialize(apiData.contact),
    };
    return new DirectoryAppliedContactModel(data);
  }

  static deserializeList(apiDataList: IAPIVMSVendorComparison[]): DirectoryAppliedContactModel[] {
    return apiDataList ? apiDataList.map(apiData => DirectoryAppliedContactModel.deserialize(apiData)) : [];
  }
}
