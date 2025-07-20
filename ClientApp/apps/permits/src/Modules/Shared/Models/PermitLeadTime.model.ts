import { CoreModel, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermitLeadTime } from '../Interfaces';

@modelProtection
export class PermitLeadTimeModel extends CoreModel {
  id: number = 0;
  leadTimeValue: number = null;
  maxLeadTimeValue: number = null;
  leadTimeType: SettingsTypeModel;
  timeLevelUOM: SettingsTypeModel;
  flightOperationalCategory: SettingsTypeModel;
  farType: SettingsTypeModel;

  // required for compare in grid
  tempId: number = Utilities.getTempId(true);

  constructor(data?: Partial<PermitLeadTimeModel>) {
    super(data);
    Object.assign(this, data);
    this.leadTimeType = new SettingsTypeModel(data?.leadTimeType);
    this.timeLevelUOM = new SettingsTypeModel(data?.timeLevelUOM);
    this.flightOperationalCategory = new SettingsTypeModel(data?.flightOperationalCategory);
    this.farType = new SettingsTypeModel(data?.farType);
  }

  static deserialize(apiData: IAPIPermitLeadTime): PermitLeadTimeModel {
    if (!apiData) {
      return new PermitLeadTimeModel();
    }
    return new PermitLeadTimeModel({
      ...apiData,
      id: apiData.leadTimeId || apiData.id,
      leadTimeType: new SettingsTypeModel({
        ...apiData.leadTimeType,
        id: apiData.leadTimeType?.leadTimeTypeId,
      }),
      timeLevelUOM: new SettingsTypeModel({
        ...apiData.timeLevelUOM,
        id: apiData.timeLevelUOM?.timeLevelUOMId,
      }),
      flightOperationalCategory: new SettingsTypeModel({
        ...apiData.flightOperationalCategory,
        id: apiData.flightOperationalCategory?.flightOperationalCategoryId,
      }),
      farType: new SettingsTypeModel({
        ...apiData.farType,
        id: apiData.farType?.farTypeId,
      }),
      ...this.deserializeAuditFields(apiData),
    });
  }

  // serialize object for create/update API
  public serialize(permitId: number): IAPIPermitLeadTime {
    return {
      permitId,
      id: this.id,
      name: this.name,
      leadTimeValue: this.leadTimeValue || null,
      maxLeadTimeValue: this.maxLeadTimeValue || null,
      leadTimeTypeId: this.leadTimeType?.id,
      statusId: this.status?.id,
      timeLevelUOMId: this.timeLevelUOM?.id,
      flightOperationalCategoryId: this.flightOperationalCategory?.id,
      farTypeId: this.farType?.id,
    };
  }

  static deserializeList(apiDataList: IAPIPermitLeadTime[]): PermitLeadTimeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPermitLeadTime) => PermitLeadTimeModel.deserialize(apiData))
      : [];
  }
}
