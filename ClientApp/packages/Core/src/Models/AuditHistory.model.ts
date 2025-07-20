import { CoreModel } from './Core.model';
import { IAPIAuditHistory } from '../Interfaces';
import { modelProtection } from '../Decorators';

@modelProtection
export class AuditHistoryModel extends CoreModel {
  event: string = '';
  columnName: string = '';
  oldValue: string = '';
  newValue: string = '';
  changes: AuditHistoryModel[];
  // view only
  path: number[];

  constructor(data?: Partial<AuditHistoryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAuditHistory): AuditHistoryModel {
    if (!apiData) {
      return new AuditHistoryModel();
    }
    const data: Partial<AuditHistoryModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      changes: AuditHistoryModel.deserializeList(apiData.changes),
    };
    return new AuditHistoryModel(data);
  }

  static deserializeList(apiDataList: IAPIAuditHistory[]): AuditHistoryModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIAuditHistory) => AuditHistoryModel.deserialize(apiData)) : [];
  }
}
