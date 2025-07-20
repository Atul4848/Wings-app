import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIHealthAuthorizationChangeRecords } from './../Interfaces';

@modelProtection
export class HealthAuthorizationChangeRecordModel extends CoreModel implements ISelectOption {
  id: number = 0;
  changedBy: string = '';
  notes: string = '';
  changedDate: string = '';

  constructor(data?: Partial<HealthAuthorizationChangeRecordModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIHealthAuthorizationChangeRecords): HealthAuthorizationChangeRecordModel {
    if (!apiData) {
      return new HealthAuthorizationChangeRecordModel();
    }
    const data: Partial<HealthAuthorizationChangeRecordModel> = {
      ...apiData,
      id: apiData.healthAuthorizationChangeRecordId || apiData.id,
    };
    return new HealthAuthorizationChangeRecordModel(data);
  }

  public serialize(): IAPIHealthAuthorizationChangeRecords {
    return {
      id: Math.floor(this.id),
      changedBy: this.changedBy,
      changedDate: this.changedDate,
      notes: this.notes,
    };
  }

  static deserializeList(apiList: IAPIHealthAuthorizationChangeRecords[]): HealthAuthorizationChangeRecordModel[] {
    return apiList
      ? apiList.map((apiData: IAPIHealthAuthorizationChangeRecords) =>
        HealthAuthorizationChangeRecordModel.deserialize(apiData)
      )
      : [];
  }

  public get label(): string {
    return this.changedBy;
  }

  public get value(): string | number {
    return this.id;
  }
}
