import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAppliedOperationalType } from '../Interfaces';

@modelProtection
export class AppliedOperationType extends CoreModel implements ISelectOption {
  operationType: SettingsTypeModel;

  constructor(data?: Partial<AppliedOperationType>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAppliedOperationalType): AppliedOperationType {
    if (!apiData) {
      return new AppliedOperationType();
    }
    const data: Partial<AppliedOperationType> = {
      ...apiData,
      operationType: SettingsTypeModel.deserialize(apiData?.operationType),
    };
    return new AppliedOperationType(data);
  }

  static deserializeList(apiDataList: IAppliedOperationalType[]): AppliedOperationType[] {
    return apiDataList
      ? apiDataList.map((apiData: IAppliedOperationalType) => AppliedOperationType.deserialize(apiData))
      : [];
  }
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
