import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIHealthVendorContact } from '../Interfaces';

@modelProtection
export class HealthVendorContactModel extends CoreModel implements ISelectOption {
  id: number = 0;
  contactType: SettingsTypeModel;
  contactLevel: SettingsTypeModel;
  contact: string = '';
  description: string = '';

  // required for temporary changes
  tempId: number = 0;

  constructor(data?: Partial<HealthVendorContactModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIHealthVendorContact): HealthVendorContactModel {
    if (!apiData) {
      return new HealthVendorContactModel();
    }
    const data: Partial<HealthVendorContactModel> = {
      ...apiData,
      id: apiData.healthVendorContactId || apiData.id,
      contactType: new SettingsTypeModel({ id: apiData.contactType?.contactTypeId }),
      contactLevel: new SettingsTypeModel({ ...apiData.contactLevel, id: apiData.contactLevel?.contactLevelId }),
    };
    return new HealthVendorContactModel(data);
  }

  public serialize(): IAPIHealthVendorContact {
    return {
      id: this.id,
      name: this.name,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
      description: this.description,
      contact: this.contact.toString(),
      contactTypeId: this.contactType?.id,
      contactLevelId: this.contactLevel?.id,
    };
  }

  static deserializeList(apiDataList: IAPIHealthVendorContact[]): HealthVendorContactModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIHealthVendorContact) => HealthVendorContactModel.deserialize(apiData))
      : [];
  }

  public get isPhoneContact(): boolean {
    return this.contactType?.id === 1;
  }

  public get isEmailContact(): boolean {
    return this.contactType?.id === 2;
  }

  public isSameData(contact: HealthVendorContactModel): boolean {
    return this.id ? Utilities.isEqual(this.id, contact.id) : Utilities.isEqual(this.tempId, contact.tempId);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
