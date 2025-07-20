import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class SettingBaseModel extends BaseModel{
  constructor(data?: Partial<SettingBaseModel>) {
    super(data);
    Object.assign(this, data);
  }
    
  static deserialize(apiData: SettingBaseModel): SettingBaseModel {
    if (!apiData) {
      return new SettingBaseModel();
    }
    const data: Partial<SettingBaseModel> = {
      ...apiData,
      description: apiData?.description ? apiData?.description : ''
    };
    return new SettingBaseModel(data);
  }
    
  static deserializeList(apiDataList: SettingBaseModel[]): SettingBaseModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => SettingBaseModel.deserialize(apiData)) : [];
  }
}