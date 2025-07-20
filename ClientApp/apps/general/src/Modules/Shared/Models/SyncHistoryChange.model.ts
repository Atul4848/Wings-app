import { modelProtection } from '@wings-shared/core';
import { IAPISyncHistoryChange } from '../Interfaces';

@modelProtection
export class SyncHistoryChangeModel {
  id: string;
  oldValue: string;
  newValue: string;
  property: string;

  constructor(data?: Partial<SyncHistoryChangeModel>) {
    Object.assign(this, data);
  }

  static deserialize(syncHistory: IAPISyncHistoryChange): SyncHistoryChangeModel {
    if (!syncHistory) {
      return new SyncHistoryChangeModel();
    }

    const data: Partial<SyncHistoryChangeModel> = {
      oldValue: syncHistory.OldValue,
      newValue: syncHistory.NewValue,
      property: syncHistory.Property,
    };

    return new SyncHistoryChangeModel(data);
  }

  static deserializeList(syncHistory: IAPISyncHistoryChange[]): SyncHistoryChangeModel[] {
    return syncHistory
      ? syncHistory.map((syncHistorys: IAPISyncHistoryChange) =>
        SyncHistoryChangeModel.deserialize(syncHistorys)
      )
      : [];
  }
}
