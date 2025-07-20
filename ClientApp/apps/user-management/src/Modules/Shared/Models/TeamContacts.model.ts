import { modelProtection } from '@wings-shared/core';
import { ITeamContactsResponse } from '../Interfaces';

@modelProtection
export class TeamContactModel {
  color: string = '';
  description: string = '';

  constructor(data?: Partial<TeamContactModel>) {
    Object.assign(this, data);
  }


  static deserialize(user: ITeamContactsResponse): TeamContactModel {
    if (!user) {
      return new TeamContactModel();
    }

    const data: Partial<TeamContactModel> = {
      color: user.Color,
      description: user.Description,
    };

    return new TeamContactModel(data);
  }



  static deserializeList(profiles: ITeamContactsResponse[]): TeamContactModel[] {
    return profiles
      ? profiles.map((user: ITeamContactsResponse) => TeamContactModel.deserialize(user))
      : [];
  }
}
