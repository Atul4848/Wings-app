import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class AddressTypeModel extends BaseModel{
  constructor(data?: Partial<AddressTypeModel>) {
    super(data);
    Object.assign(this, data);
  }
    
  static deserialize(apiData: AddressTypeModel): AddressTypeModel {
    if (!apiData) {
      return new AddressTypeModel();
    }
    const data: Partial<AddressTypeModel> = {
      ...apiData
    };
    return new AddressTypeModel(data);
  }
    
  static deserializeList(apiDataList: AddressTypeModel[]): AddressTypeModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => AddressTypeModel.deserialize(apiData)) : [];
  }
}