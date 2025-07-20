import { IAPIVmsVendorStatusTable } from '../Interfaces';
import { CoreModel, ISelectOption, StatusTypeModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class StatusBaseModel extends BaseModel {
  userId:string='';
  
  constructor(data?: Partial<StatusBaseModel>) {
    super();
    Object.assign(this, data);
    
  }

  static deserialize(apiData: IAPIVmsVendorStatusTable): StatusBaseModel {
    if (!apiData) {
      return new StatusBaseModel();
    }
    const data: Partial<StatusBaseModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData)
    };
    if(apiData.serviceCategory)
    {
      data.serviceCategory = StatusBaseModel.deserialize(apiData.serviceCategory);
    }
    return new StatusBaseModel(data);
  }

  static deserializeFromSettingsTypeModel(apiData: SettingsTypeModel): StatusBaseModel {
    if (!apiData) {
      return new StatusBaseModel();
    }
    const data: Partial<StatusBaseModel> = {
      id:apiData.id,
      name:apiData.name,
      ...CoreModel.deserializeAuditFields(apiData)
    };
    return new StatusBaseModel(data);
  }

  static deserializeList(apiDataList: IAPIVmsVendorStatusTable[]): StatusBaseModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => StatusBaseModel.deserialize(apiData)) : [];
  }

  
}
