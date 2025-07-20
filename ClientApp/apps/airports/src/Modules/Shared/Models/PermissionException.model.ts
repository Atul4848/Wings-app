import { CoreModel, getBooleanToString, getYesNoNullToBoolean, SettingsTypeModel } from '@wings-shared/core';
import { IPermissionExceptionResponse, IPermissionExceptionRequest } from '../Interfaces';
import { DynamicEntityModel } from '@wings/shared';

export class PermissionExceptionModel extends CoreModel {
  exceptionRequirement: SettingsTypeModel;
  exceptionEntityType: SettingsTypeModel;

  // ON API this is propertyName string filed
  entityParameter: SettingsTypeModel;
  exceptionConditionalOperator: SettingsTypeModel;
  permissionExceptionValues: DynamicEntityModel[];

  constructor(data?: Partial<PermissionExceptionModel>) {
    super(data);
    Object.assign(this, data);
    this.exceptionRequirement = data?.exceptionRequirement ? new SettingsTypeModel(data?.exceptionRequirement) : null;
    this.exceptionEntityType = data?.exceptionEntityType ? new SettingsTypeModel(data?.exceptionEntityType) : null;
    this.exceptionConditionalOperator = data?.exceptionConditionalOperator
      ? new SettingsTypeModel(data?.exceptionConditionalOperator)
      : null;
  }

  static deserialize(apiData: IPermissionExceptionResponse): PermissionExceptionModel {
    if (!apiData) {
      return new PermissionExceptionModel();
    }
    return new PermissionExceptionModel({
      ...apiData,
      ...this.deserializeAuditFields(apiData),
      id: apiData.permissionExceptionId || apiData.id,
      entityParameter: new SettingsTypeModel({
        ...apiData.entityParameter,
        id: apiData.entityParameter?.entityParameterId,
      }),
      exceptionRequirement: new SettingsTypeModel({
        ...apiData.exceptionRequirement,
        id: apiData.exceptionRequirement?.exceptionRequirementId,
      }),
      exceptionEntityType: new SettingsTypeModel({
        ...apiData.exceptionEntityType,
        id: apiData.exceptionEntityType?.exceptionEntityTypeId,
      }),
      exceptionConditionalOperator: new SettingsTypeModel({
        ...apiData.exceptionConditionalOperator,
        id: apiData.exceptionConditionalOperator?.exceptionConditionalOperatorId,
      }),
      permissionExceptionValues: apiData.permissionExceptionValues
        ? apiData.permissionExceptionValues.map(x => {
          const val = getYesNoNullToBoolean(x.value as string);
          return new DynamicEntityModel({
            id: x.id,
            entityId: x.entityId,
            code: x.enityCode,
            name: typeof val === 'boolean' ? val : x.value,
          });
        })
        : null,
    });
  }

  static deserializeList(apiDataList: IPermissionExceptionResponse[]): PermissionExceptionModel[] {
    return apiDataList ? apiDataList.map(apiData => PermissionExceptionModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(permissionId: number): IPermissionExceptionRequest {
    const permissionExceptionId = this.id || 0;
    return {
      permissionId,
      id: permissionExceptionId,
      name: this.name,
      entityParameterId: this.entityParameter?.id,
      permissionExceptionValues:
        this.permissionExceptionValues.map(x => {
          x.name = getBooleanToString(x.name as boolean) || x.name;
          return {
            id: x.isTempId ? 0 : x.id || 0,
            permissionExceptionId: permissionExceptionId,
            entityId: x.entityId || 0,
            enityCode: x.code,
            value: x.name || '',
          };
        }) || [],
      exceptionRequirementId: this.exceptionRequirement?.id,
      exceptionEntityTypeId: this.exceptionEntityType?.id,
      exceptionConditionalOperatorId: this.exceptionConditionalOperator?.id,
    };
  }
}
