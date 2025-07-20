import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIVMSVendorComparison } from '../Interfaces';
import { SettingBaseModel } from './SettingBase.model';
import { DirectoryAppliedContactModel } from './DirectoryAppliedContact.model';

@modelProtection
export class DirectoryCodeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code?: string;
  appliedContact: DirectoryAppliedContactModel[] = [];

  constructor(data?: Partial<DirectoryCodeModel>) {
    super(data);
    Object.assign(this, data);
  }
  // required in auto complete
  public get label(): string {
    return this.code;
  }

  public get value(): string | number {
    return this.id;
  }

  public serialize() {
    return {
      userId: '',
      id: this.id,
      code: this.code || '',
      appliedContact: this.appliedContact.map(item => item.serialize()),
    };
  }

  static deserialize(apiData: DirectoryCodeModel): DirectoryCodeModel {
    if (!apiData) {
      return new DirectoryCodeModel();
    }
    const data: Partial<DirectoryCodeModel> = {
      ...apiData,
      appliedContact: DirectoryAppliedContactModel.deserializeList(apiData?.appliedContact.map(item=>{
        return {
          ...item,
          id: item.contact.id,
          contact: SettingBaseModel.deserialize(item.contact),
          appliedContactId: item.id
        }
      })),
    };
    return new DirectoryCodeModel(data);
  }

  static deserializeList(apiDataList: DirectoryCodeModel[]): DirectoryCodeModel[] {
    return apiDataList ? apiDataList.map(apiData => DirectoryCodeModel.deserialize(apiData)) : [];
  }
}
