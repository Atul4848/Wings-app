import { CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermissionTolerance } from '../Interfaces';

export class PermissionToleranceModel extends CoreModel {
  permissionRequiredFors: SettingsTypeModel[] = [];
  toleranceMinus: number;
  tolerancePlus: number;

  constructor(data?: Partial<PermissionToleranceModel>) {
    super(data);
    Object.assign(this, data);
    this.permissionRequiredFors = data.permissionRequiredFors?.map(x => new SettingsTypeModel(x)) || [];
  }

  static deserialize(apiData: IAPIPermissionTolerance): PermissionToleranceModel {
    if (!apiData) {
      return new PermissionToleranceModel();
    }
    return new PermissionToleranceModel({
      ...apiData,
      ...this.deserializeAuditFields(apiData),
      id: apiData.permissionToleranceId || apiData.id,
      permissionRequiredFors: apiData.permissionRequiredFors?.map(
        x =>
          new SettingsTypeModel({
            ...x,
            id: x.permissionRequiredForId,
          })
      ),
    });
  }

  // serialize object for create/update API
  public serialize(permissionId: number): IAPIPermissionTolerance {
    return {
      permissionId,
      id: this.id || 0,
      permissionRequiredForIds: this.permissionRequiredFors.map(x => x.id),
      toleranceMinus: Number(this.toleranceMinus) || null,
      tolerancePlus: Number(this.tolerancePlus) || null,
    };
  }

  static deserializeList(apiDataList: IAPIPermissionTolerance[]): PermissionToleranceModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPermissionTolerance) => PermissionToleranceModel.deserialize(apiData))
      : [];
  }
}
