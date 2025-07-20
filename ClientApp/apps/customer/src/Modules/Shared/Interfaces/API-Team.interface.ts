import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPITeam extends IBaseApiResponse {
  teamId?: number;
  code: string;
  isInternal: boolean;
  managerNameModel?: IBaseApiResponse;
  managerEmail: string;
  managerPhone: string;
  managerPhoneExtension: string;
  groupEmail: string;
  tollFreePhone: string;
  usPhone: string;
  faxNumber: string;
  displayOrder: number;
  rmpEmail: string;
  teamEmailComms: IAPIEmailComms[];
  teamTypeIds: Number[];
  //response
  associatedTeamTypes: IAPIAssociatedTeamTypes[];
  managerName:string
}

export interface IAPIEmailComms extends IBaseApiResponse {
  teamId: number;
  contact: string;
  teamUseTypeIds: Number[];

  //Response fields
  teamEmailCommId?: number;
  associatedTeamUseTypes: IAPIAssociatedUseTeamTypes[];
}

export interface IAPIAssociatedUseTeamTypes extends IBaseApiResponse {
  associatedTeamUseTypeId: number;
  teamUseType: IAPITeamUseType;
}

export interface IAPITeamUseType extends IBaseApiResponse {
  teamUseTypeId: number;
}

export interface IAPIAssociatedTeamTypes extends IBaseApiResponse {
  associatedTeamUseTypeId: number;
  teamType: IAPITeamType;
}

export interface IAPITeamType extends IBaseApiResponse {
  teamTypeId: number;
}
