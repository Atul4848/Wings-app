import { CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermissionLeadTime } from '../Interfaces';

export class PermissionLeadTimeModel extends CoreModel {
  leadTime: number;
  leadTimeType: SettingsTypeModel;
  leadTimeUOM: SettingsTypeModel;

  constructor(data?: Partial<PermissionLeadTimeModel>) {
    super(data);
    Object.assign(this, data);
    this.leadTimeType = data?.leadTimeType ? new SettingsTypeModel(data?.leadTimeType) : null;
    this.leadTimeUOM = data?.leadTimeUOM ? new SettingsTypeModel(data?.leadTimeUOM) : null;
  }

  static deserialize(apiData: IAPIPermissionLeadTime): PermissionLeadTimeModel {
    if (!apiData) {
      return new PermissionLeadTimeModel();
    }
    return new PermissionLeadTimeModel({
      ...apiData,
      ...this.deserializeAuditFields(apiData),
      id: apiData.permissionLeadTimeId || apiData.id,
      leadTimeType: new SettingsTypeModel({
        ...apiData.leadTimeType,
        id: apiData.leadTimeType?.permissionLeadTimeTypeId,
      }),
      leadTimeUOM: new SettingsTypeModel({
        ...apiData.leadTimeUOM,
        id: apiData.leadTimeUOM?.leadTimeUOMId || apiData.leadTimeUOM?.timeLevelUOMId,
      }),
    });
  }

  // serialize object for create/update API
  public serialize(permissionId: number): IAPIPermissionLeadTime {
    return {
      permissionId,
      id: this.id || 0,
      leadTime: this.leadTime || null,
      leadTimeTypeId: this.leadTimeType?.id,
      leadTimeUOMId: this.leadTimeUOM?.id,
    };
  }

  static deserializeList(apiDataList: IAPIPermissionLeadTime[]): PermissionLeadTimeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPermissionLeadTime) => PermissionLeadTimeModel.deserialize(apiData))
      : [];
  }
}
