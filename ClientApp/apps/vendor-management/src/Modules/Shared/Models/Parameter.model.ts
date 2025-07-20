import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class ParameterModel extends BaseModel{
  constructor(data?: Partial<ParameterModel>) {
    super(data);
    Object.assign(this, data);
  }
    
  static deserialize(apiData: ParameterModel): ParameterModel {
    if (!apiData) {
      return new ParameterModel();
    }
    const data: Partial<ParameterModel> = {
      ...apiData
    };
    return new ParameterModel(data);
  }
    
  static deserializeList(apiDataList: ParameterModel[]): ParameterModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => ParameterModel.deserialize(apiData)) : [];
  }
}