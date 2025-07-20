import { CoreModel,ISelectOption, modelProtection } from '@wings-shared/core'
import { IAPIVMSVendorComparison } from '../Interfaces';
import { SettingBaseModel } from './SettingBase.model';

@modelProtection
export class ContactMasterModel extends CoreModel implements ISelectOption {
  id:number =0;
  contactMethod:SettingBaseModel=new SettingBaseModel();
  contact: string='';
  contactType:SettingBaseModel = new SettingBaseModel();
  contactName: string='';
  title?: string;
  isSMSCompatible: boolean=false;
  isSMSOpt: boolean=false;
  status:SettingBaseModel = new SettingBaseModel();
  accessLevel:SettingBaseModel = new SettingBaseModel();

  constructor(data?: Partial<ContactMasterModel>) {
    super(data);
    Object.assign(this, data);
  }
  // required in auto complete
  public get label(): string {
    return ContactMasterModel.getDisplayContactLabel(this);
  }

  public get value(): string | number {
    return this.id;
  }
  
  static getDisplayContactLabel(value:ContactMasterModel){
    const contactName= value.contactName ?  `-${value.contactName}` : ''
    return `${value.contactMethod.name}-${value?.contact}-${value?.contactType.name}${contactName}`
  }

  public serialize() {
    return {
      userId: '',
      id: this.id,
      contactMethodId: this.contactMethod.id,
      contact: this.contact,
      contactTypeId: this.contactType.id,
      contactName: this.contactName,
      title: this.title?.replace(/^\s*\s*$/, '') || undefined,
      isSMSCompatible: this.isSMSCompatible,
      isSMSOpt: this.isSMSOpt,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id
    };
  }

  static deserialize(apiData: IAPIVMSVendorComparison): ContactMasterModel {
    if (!apiData) {
      return new ContactMasterModel();
    }
    const data: Partial<ContactMasterModel> = {
      ...apiData,
      contactMethod: SettingBaseModel.deserialize(apiData.contactMethod),
      contactType: SettingBaseModel.deserialize(apiData.contactType),
      accessLevel: SettingBaseModel.deserialize(apiData.accessLevel),
      status: SettingBaseModel.deserialize(apiData.status),      

    };
    return new ContactMasterModel(data);
  }



  static deserializeList(apiDataList: IAPIVMSVendorComparison[]): ContactMasterModel[] {
    return apiDataList ? apiDataList.map((apiData) => ContactMasterModel.deserialize(apiData)) : [];
  }
}