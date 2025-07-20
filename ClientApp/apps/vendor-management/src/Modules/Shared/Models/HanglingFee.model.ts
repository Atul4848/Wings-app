import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class HandlingFeeModel extends BaseModel{
  constructor(data?: Partial<HandlingFeeModel>) {
    super(data);
    Object.assign(this, data);
  }
    
  static deserialize(apiData: HandlingFeeModel): HandlingFeeModel {
    if (!apiData) {
      return new HandlingFeeModel();
    }
    const data: Partial<HandlingFeeModel> = {
      ...apiData
    };
    return new HandlingFeeModel(data);
  }
    
  static deserializeList(apiDataList: HandlingFeeModel[]): HandlingFeeModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => HandlingFeeModel.deserialize(apiData)) : [];
  }
}