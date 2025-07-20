import { modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';
import { SettingBaseModel } from './SettingBase.model';

@modelProtection
export class GroundServiceProviderOperationType extends BaseModel {
  id: number;
  groundServiceProviderId: number;
  operationType: SettingBaseModel = new SettingBaseModel();

  constructor(data?: Partial<GroundServiceProviderOperationType>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: GroundServiceProviderOperationType): GroundServiceProviderOperationType {
    if (!apiData) {
      return new GroundServiceProviderOperationType();
    }
    const data: Partial<GroundServiceProviderOperationType> = {
      ...apiData,
      groundServiceProviderId: apiData.groundServiceProviderId,
      operationType: SettingBaseModel.deserialize(apiData.operationType),
    };
    return new GroundServiceProviderOperationType(data);
  }

  static deserializeList(apiDataList: GroundServiceProviderOperationType[]): GroundServiceProviderOperationType[] {
    return apiDataList
      ? apiDataList.map((apiData: any) => GroundServiceProviderOperationType.deserialize(apiData))
      : [];
  }
}
