import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';
import { SettingBaseModel } from './SettingBase.model';

@modelProtection
export class ServiceItemModel extends BaseModel{
  public serviceCategoryId:number;
  public serviceCategory:SettingBaseModel;

  public netSuiteId:number;

  public userId:string='';

  public fBOOneID:number;

  public serviceCategoryName:string;
  public isPrepopulate:boolean;

  constructor(data?: Partial<ServiceItemModel>) {
    super(data);
    Object.assign(this, data);
  }
  
  static deserialize(apiData: ServiceItemModel): ServiceItemModel {
    if (!apiData) {
      return new ServiceItemModel();
    }
    const data: Partial<ServiceItemModel> = {
      ...apiData,
      netSuiteId:parseInt(`${apiData.netSuiteId}`),
      serviceCategory:SettingBaseModel.deserialize(apiData.serviceCategory),
      isPrepopulate:apiData.isPrepopulate,
    };
    return new ServiceItemModel(data);
  }
  
  static deserializeList(apiDataList: ServiceItemModel[]): ServiceItemModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => ServiceItemModel.deserialize(apiData)) : [];
  }
}