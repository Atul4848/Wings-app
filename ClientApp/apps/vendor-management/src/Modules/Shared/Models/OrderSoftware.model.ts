import { CoreModel, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { IAPIResponseOrderSoftware } from '../Interfaces/Response/API-Response-OrderSoftware';

@modelProtection
export class OrderSoftwareModel extends CoreModel {
  id: number = 0;
  vendorLocationId: number;
  orderManagementSoftware: SettingBaseModel = new SettingBaseModel();
  url: string;
  passkey: string;
  orderManagementUserId: string;
  password: string;
  team: string;
  fboOne: string;

  constructor(data?: Partial<OrderSoftwareModel>) { 
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: OrderSoftwareModel): OrderSoftwareModel {
    if (!apiData) {
      return new OrderSoftwareModel();
    }
    const data: Partial<OrderSoftwareModel> = {
      ...apiData,
      id: apiData.id,
      orderManagementSoftware: SettingBaseModel.deserialize(apiData.orderManagementSoftware) ,
    };
    return new OrderSoftwareModel(data);
  }

  public serialize(vendorLocationId:number): IAPIResponseOrderSoftware {
    return {
      ...this._serialize(),
      userId: this.userId,
      id: this.id || 0,
      vendorLocationId: vendorLocationId,
      orderManagementSoftwareId: this.orderManagementSoftware.id,
      url: this.url,
      passkey: this.passkey || null,
      orderManagementUserId: this.orderManagementUserId || null,
      password: this.password || null,
      team: this.team || null,
      fboOne: this.fboOne || null
    };
  }

  static deserializeList(apiDataList: IAPIResponseOrderSoftware[]): OrderSoftwareModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => OrderSoftwareModel.deserialize(apiData)) : [];
  }
}
