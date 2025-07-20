import { IBaseApiResponse } from '@wings-shared/core';

export interface IPermissionExceptionValue {
  id: number;
  permissionExceptionId: number;
  entityId: number;
  enityCode: string;
  value: string | boolean | number;
}

// Request Model
export interface IPermissionExceptionRequest extends IBaseApiResponse {
  id: number;
  exceptionRequirementId: number;
  exceptionEntityTypeId: number;
  exceptionConditionalOperatorId: number;
  permissionId: number;
  name: string;
  entityParameterId: number;
  permissionExceptionValues: IPermissionExceptionValue[];
}

// =======================
// Response Model
// =======================

export interface IEntityParameter {
  entityParameterId: number;
  name: string;
}

export interface IExceptionRequirement {
  exceptionRequirementId: number;
  name: string;
}

export interface IExceptionEntityType {
  exceptionEntityTypeId: number;
  name: string;
}

export interface IExceptionConditionalOperator {
  exceptionConditionalOperatorId: number;
  name: string;
}

export interface IPermissionExceptionResponse {
  id: number;
  permissionExceptionId: number; // This is the same as id in request

  permissionId: number;
  name: string;

  entityParameter: IEntityParameter;
  exceptionRequirement: IExceptionRequirement;
  exceptionEntityType: IExceptionEntityType;
  exceptionConditionalOperator: IExceptionConditionalOperator;
  permissionExceptionValues: IPermissionExceptionValue[];
}
