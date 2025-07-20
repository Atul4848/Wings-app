import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class CurrencyModel extends BaseModel{
    public Code:string;
    
    constructor(data?: Partial<CurrencyModel>) {
      super(data);
      Object.assign(this, data);
    }
    
    static deserialize(apiData: CurrencyModel): CurrencyModel {
      if (!apiData) {
        return new CurrencyModel();
      }
      const data: Partial<CurrencyModel> = {
        ...apiData
      };
      return new CurrencyModel(data);
    }
    
    static deserializeList(apiDataList: CurrencyModel[]): CurrencyModel[] {
      return apiDataList ? apiDataList.map((apiData: any) => CurrencyModel.deserialize(apiData)) : [];
    }
}