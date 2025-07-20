import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIUserRef } from '@wings/shared';

export interface IAPITeamMember extends IBaseApiResponse {
  teamMemberId?: number;
  extension: string;
  companyCell: string;
  person: IAPIUserRef;
  teams: IAPITeam[];
}

interface IAPITeam extends IBaseApiResponse {
  teamId: number;
  code: string;
}

export interface IAPITeamMemberRequest extends IBaseApiResponse {
  extension: string;
  companyCell: string;
  personGuid: string;
  personFirstName: string;
  personLastName: string;
  personEmail: string;
}
