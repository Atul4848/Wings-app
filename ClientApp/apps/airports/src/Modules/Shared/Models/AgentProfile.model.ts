import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAgentProfile } from '../Interfaces';

@modelProtection
export class AgentProfileModel extends CoreModel {
  profileUrl?: string;

  constructor(data?: Partial<AgentProfileModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAgentProfile): AgentProfileModel {
    if (!apiData) {
      return new AgentProfileModel();
    }
    const data: Partial<AgentProfileModel> = {
      ...apiData,
    };
    return new AgentProfileModel(data);
  }

  public serialize(): IAPIAgentProfile {
    return {
      id: 0,
      profileUrl: this.profileUrl,
    };
  }
}
