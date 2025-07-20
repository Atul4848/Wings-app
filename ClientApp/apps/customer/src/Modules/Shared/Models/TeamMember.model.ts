import { CoreModel, IdNameCodeModel } from '@wings-shared/core';
import { IAPITeamMember, IAPITeamMemberRequest } from '../Interfaces';
import { UserRefModel } from '@wings/shared';

export class TeamMemberModel extends CoreModel {
  extension: string = '';
  companyCell: string = '';
  person: UserRefModel;
  teams: IdNameCodeModel[];

  constructor(data?: Partial<TeamMemberModel>) {
    super(data);
    Object.assign(this, data);
    this.teams = data.teams?.map(x => new IdNameCodeModel(x)) || [];
  }

  static deserialize(apiData: IAPITeamMember): TeamMemberModel {
    if (!apiData) {
      return new TeamMemberModel();
    }
    const data: Partial<TeamMemberModel> = {
      ...apiData,
      ...this.deserializeAuditFields(apiData),
      id: apiData.teamMemberId || apiData.id,
      person: UserRefModel.deserialize(apiData.person),
      teams: apiData.teams?.map(x => new IdNameCodeModel({ ...x, id: x.teamId || x.id })),
    };
    return new TeamMemberModel(data);
  }

  static deserializeList(apiDataList: IAPITeamMember[]): TeamMemberModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPITeamMember) => TeamMemberModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): IAPITeamMemberRequest {
    return {
      id: this.id || 0,
      personGuid: this.person.guid,
      personFirstName: this.person.firstName,
      personLastName: this.person.lastName,
      personEmail: this.person.email,
      extension: this.extension,
      companyCell: this.companyCell,
    };
  }

  // required in auto complete
  public get label(): string {
    if (this.person.fullName && this.person.email) {
      return `${this.person.fullName} (${this.person.email})`;
    }
    return this.person.fullName || this.person.email;
  }

  public get value(): number {
    return this.id;
  }
}
