import { modelProtection, CoreModel, SettingsTypeModel, Utilities } from '@wings-shared/core';
import { IAPITeam } from '../Interfaces';
import { TeamEmailCommsModel } from './TeamEmailComms.model';

@modelProtection
export class TeamModel extends CoreModel {
  code: string;
  isInternal: boolean = false;
  managerNameModel: SettingsTypeModel;
  managerEmail: string;
  managerPhone: string;
  managerPhoneExtension: string;
  groupEmail: string;
  tollFreePhone: string;
  usPhone: string;
  faxNumber: string;
  displayOrder: number;
  rmpEmail: string;
  teamEmailComms: TeamEmailCommsModel[] = [];
  associatedTeamTypes: SettingsTypeModel[] = [];
  managerName: string;

  constructor(data?: Partial<TeamModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPITeam): TeamModel {
    if (!apiData) {
      return new TeamModel();
    }
    const data: Partial<TeamModel> = {
      ...apiData,
      id: apiData.teamId || apiData.id,
      managerNameModel: apiData.managerName
        ? SettingsTypeModel.deserialize({
          name: apiData.managerName,
          id: null,
        })
        : new SettingsTypeModel(),
      associatedTeamTypes: apiData.associatedTeamTypes?.map(x => {
        return SettingsTypeModel.deserialize({
          id: x.teamType?.teamTypeId,
          name: x.teamType?.name,
        });
      }),
      teamEmailComms: TeamEmailCommsModel.deserializeList(apiData.teamEmailComms),
      ...this.deserializeAuditFields(apiData),
    };
    return new TeamModel(data);
  }

  static deserializeList(apiDataList: IAPITeam[]): TeamModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPITeam) => TeamModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize() {
    return {
      id: this.id || 0,
      name: this.name,
      code: this.code,
      isInternal: this.isInternal || false,
      managerName: this.managerNameModel?.label,
      managerEmail: this.managerEmail,
      managerPhone: this.managerPhone,
      managerPhoneExtension: this.managerPhoneExtension,
      groupEmail: this.groupEmail,
      tollFreePhone: this.tollFreePhone,
      usPhone: this.usPhone,
      faxNumber: this.faxNumber,
      displayOrder: Utilities.getNumberOrNullValue(this.displayOrder),
      rmpEmail: this.rmpEmail,
      teamTypeIds: this.associatedTeamTypes.map(type => type.id),
      teamEmailComms: this.teamEmailComms.map(emailComms => {
        return {
          id: emailComms.id,
          teamId: this.id || 0,
          contact: emailComms.contact,
          teamUseTypeIds: emailComms.teamUseType?.map(useType => useType.id),
          statusId: emailComms.status?.value,
          accessLevelId: emailComms.accessLevel?.id,
        };
      }),
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
