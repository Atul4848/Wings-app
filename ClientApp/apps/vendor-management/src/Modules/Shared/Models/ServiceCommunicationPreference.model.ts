import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { ContactMasterModel } from './ContactMaster.model';
import { 
  IAPIRequestVendorLocationServiceComm 
} from '../Interfaces/Request/API-Request-VendorLocationServiceComm.interface';
import { VendorLocationContactModel } from './VendorLocationContact.model';
import { 
  IAPIResponseVendorLocationServiceComm 
} from '../Interfaces/Response/API-Response-VendorLocationServiceComm.interface';

@modelProtection
export class ServiceCommunicationPreferenceModel extends CoreModel implements ISelectOption {
    id:number =0;
    serviceComm: number= 0;
    attention?: string;
    contactUsegeType: SettingBaseModel = new SettingBaseModel();
    vendorLocationContact: VendorLocationContactModel = new VendorLocationContactModel();
    status: SettingBaseModel = new SettingBaseModel();
    accessLevel: SettingBaseModel = new SettingBaseModel();

    constructor(data?: Partial<ServiceCommunicationPreferenceModel>) {
      super(data);
      Object.assign(this, data);
    }


    // required in auto complete
    public get label(): string {
      return ContactMasterModel.getDisplayContactLabel(this.vendorLocationContact?.contact);
    }

    public get value(): string | number {
      return this.id;
    }
    
    public serialize():IAPIRequestVendorLocationServiceComm {
      return {
        userId: this.userId,
        id: this.id || 0,
        serviceCommId: this.serviceComm?.id,
        attention: this.attention || undefined,
        contactUsegeTypeId: this.contactUsegeType.id,
        vendorLocationContactId: this.vendorLocationContact.id,
        statusId: this.status?.id,
        accessLevelId: this.accessLevel?.id,
      };
    }

    static deserialize(apiData: IAPIResponseVendorLocationServiceComm): ServiceCommunicationPreferenceModel {
      if (!apiData) {
        return new ServiceCommunicationPreferenceModel();
      }
      const data: Partial<ServiceCommunicationPreferenceModel> = {
        ...apiData,
        serviceComm: SettingBaseModel.deserialize(apiData.serviceComm),
        vendorLocationContact: VendorLocationContactModel.deserialize({ ...apiData.vendorLocationContact,
          id:apiData.vendorLocationContact.vendorLocationContactId }),
        contactUsegeType: SettingBaseModel.deserialize(apiData.contactUsegeType),
        accessLevel: SettingBaseModel.deserialize(apiData.accessLevel),
        status: SettingBaseModel.deserialize(apiData.status),
      };
      return new ServiceCommunicationPreferenceModel(data);
    }

    static deserializeList(apiDataList: IAPIResponseVendorLocationServiceComm[]): 
    ServiceCommunicationPreferenceModel[] {
      return apiDataList ? apiDataList.map(apiData => ServiceCommunicationPreferenceModel.deserialize(apiData)) : [];
    }
}
