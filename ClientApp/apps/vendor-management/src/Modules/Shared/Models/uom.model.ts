import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class UOMModel extends BaseModel{
  constructor(data?: Partial<UOMModel>) {
    super(data);
    Object.assign(this, data);
  }
    
  static deserialize(apiData: UOMModel): UOMModel {
    if (!apiData) {
      return new UOMModel();
    }
    const data: Partial<UOMModel> = {
      ...apiData
    };
    return new UOMModel(data);
  }
    
  static deserializeList(apiDataList: UOMModel[]): UOMModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => UOMModel.deserialize(apiData)) : [];
  }
}