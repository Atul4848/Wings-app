import { IAPICruiseSchedule } from '../Interfaces';
import { AccessLevelModel, CoreModel, SourceTypeModel, modelProtection } from '@wings-shared/core';
@modelProtection
export class CruiseScheduleModel extends CoreModel {
  profile: string = '';
  description: string = '';
  navBlueSchedule: string = '';
  uvGoSchedule: string = '';
  foreFlightSchedule: string = '';
  collinsSchedule: string = '';

  constructor(data?: Partial<CruiseScheduleModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICruiseSchedule): CruiseScheduleModel {
    if (!apiData) {
      return new CruiseScheduleModel();
    }
    const data: Partial<CruiseScheduleModel> = {
      accessLevel: AccessLevelModel.deserialize(apiData?.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData?.sourceType),
      name: apiData.profile,
      ...apiData,
    };
    return new CruiseScheduleModel(data);
  }

  public serialize(): IAPICruiseSchedule {
    return {
      id: this.id,
      description: this.description,
      profile: this.profile,
      navBlueSchedule: this.navBlueSchedule,
      uvGoSchedule: this.uvGoSchedule,
      foreFlightSchedule: this.foreFlightSchedule,
      collinsSchedule: this.collinsSchedule,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPICruiseSchedule[]): CruiseScheduleModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPICruiseSchedule) => CruiseScheduleModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
