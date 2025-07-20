import { CoreModel, modelProtection } from '@wings-shared/core'
import { IAPISecurityThreatLevel } from '../Interfaces';

@modelProtection
export class SecurityThreatLevelModel extends CoreModel {
  refreshFrequency: string = '';
  lastRefreshDate: string = '';

  constructor(data?: Partial<SecurityThreatLevelModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPISecurityThreatLevel): SecurityThreatLevelModel {
    if (!apiData) {
      return new SecurityThreatLevelModel();
    }
    return new SecurityThreatLevelModel({ ...apiData });
  }

  static deserializeList(apiDataList: IAPISecurityThreatLevel[]): SecurityThreatLevelModel[] {
    return apiDataList
      ? apiDataList.map((securityThreatLevel: IAPISecurityThreatLevel) =>
        SecurityThreatLevelModel.deserialize(securityThreatLevel)
      )
      : [];
  }
}
