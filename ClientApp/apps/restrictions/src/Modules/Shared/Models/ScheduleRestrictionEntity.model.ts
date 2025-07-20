import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIScheduleRestrictionsEntity } from '../Interfaces';

@modelProtection
export class ScheduleRestrictionEntityModel extends CoreModel implements ISelectOption {
  id: number = 0;
  entityId: number = 0; // id from mapped model
  code: string = '';
  entityName: string = '';

  constructor(data?: Partial<ScheduleRestrictionEntityModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIScheduleRestrictionsEntity): ScheduleRestrictionEntityModel {
    if (!apiData) {
      return new ScheduleRestrictionEntityModel();
    }
    const data: Partial<ScheduleRestrictionEntityModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.restrictingEntityId || apiData.id,
      entityId: apiData.entityId,
      code: apiData.code,
      entityName: apiData.name,
    };
    return new ScheduleRestrictionEntityModel(data);
  }

  // serialize object for create/update API
  public serialize(scheduleRestrictionId: number): IAPIScheduleRestrictionsEntity {
    return {
      id: this.id || 0,
      code: this.code,
      entityId: this.entityId,
      name: this.entityName,
      scheduleRestrictionId,
    };
  }

  static deserializeList(apiDataList: IAPIScheduleRestrictionsEntity[]): ScheduleRestrictionEntityModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIScheduleRestrictionsEntity) =>
        ScheduleRestrictionEntityModel.deserialize(apiData)
      )
      : [];
  }

  public get label(): string {
    return this.code;
  }

  public get value(): string | number {
    return this.entityId;
  }
}
