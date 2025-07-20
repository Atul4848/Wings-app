import { CoreModel, IdNameCodeModel, ISelectOption } from '@wings-shared/core';
import { TeamMemberModel } from './TeamMember.model';
import { IAPIInternalUserAssignment, IAPIInternalUserAssignmentRequest } from '../Interfaces';

export class InternalUserAssignmentModel extends CoreModel implements ISelectOption {
  teamMember: TeamMemberModel;
  team: IdNameCodeModel;

  constructor(data?: Partial<InternalUserAssignmentModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIInternalUserAssignment): InternalUserAssignmentModel {
    if (!apiData) {
      return new InternalUserAssignmentModel();
    }
    const data: Partial<InternalUserAssignmentModel> = {
      ...apiData,
      id: apiData.associatedTeamMemberId || apiData.id,
      team: new IdNameCodeModel({
        ...apiData.team,
        id: apiData.team?.teamId || apiData.team?.id,
      }),
      teamMember: TeamMemberModel.deserialize({
        ...apiData.teamMember,
        id: apiData.teamMember?.teamMemberId || apiData.teamMember?.id,
      }),
      ...this.deserializeAuditFields(apiData),
    };
    return new InternalUserAssignmentModel(data);
  }

  // serialize object for create/update API
  public serialize(teamId): IAPIInternalUserAssignmentRequest {
    return {
      teamId,
      id: this.id || 0,
      teamMemberId: this.teamMember?.id,
      statusId: this.status?.id,
    };
  }

  static deserializeList(apiDataList: IAPIInternalUserAssignment[]): InternalUserAssignmentModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIInternalUserAssignment) => InternalUserAssignmentModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.teamMember.label;
  }

  public get value(): number {
    return this.id;
  }
}
