import { IBaseApiResponse } from '@wings-shared/core';
import { IAPITeamMember } from './API-TeamMember.interface';

export interface IAPIInternalUserAssignment extends IBaseApiResponse {
  associatedTeamMemberId?: number;
  teamMember: IAPITeamMember;
  team: IAPITeam;
}

export interface IAPIInternalUserAssignmentRequest extends IBaseApiResponse {
  teamId: number;
  teamMemberId: number;
}

interface IAPITeam extends IBaseApiResponse {
  teamId: number;
  code: string;
}
