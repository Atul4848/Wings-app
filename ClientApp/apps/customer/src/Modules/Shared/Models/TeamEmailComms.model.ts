import { modelProtection, CoreModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIEmailComms, IAPITeam } from '../Interfaces';

@modelProtection
export class TeamEmailCommsModel extends CoreModel {
  teamId: number;
  contact: string;
  teamUseType: SettingsTypeModel[];

  constructor(data?: Partial<TeamEmailCommsModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIEmailComms): TeamEmailCommsModel {
    if (!apiData) {
      return new TeamEmailCommsModel();
    }
    const data: Partial<TeamEmailCommsModel> = {
      ...apiData,
      id: apiData.teamEmailCommId || apiData.id,
      teamUseType: apiData.associatedTeamUseTypes.map(x => {
        return SettingsTypeModel.deserialize({
          id: x.teamUseType?.teamUseTypeId,
          name: x.teamUseType?.name,
        });
      }),
      ...this.deserializeAuditFields(apiData),
    };
    return new TeamEmailCommsModel(data);
  }

  static deserializeList(apiDataList: IAPIEmailComms[]): TeamEmailCommsModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEmailComms) => TeamEmailCommsModel.deserialize(apiData)) : [];
  }
}
