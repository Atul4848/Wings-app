import { modelProtection } from '@wings-shared/core';
import { Hash } from 'crypto';
import { IAPISyncHistoryDataSync } from '../Interfaces';
import { SyncHistoryChangeModel } from './SyncHistoryChange.model';

@modelProtection
export class SyncHistoryDataSyncModel {
  active: boolean;
  jobId: number;
  dataSyncDate: Date;
  syncType: string;
  isOnHold: boolean;
  cappsHash: Hash;
  currentHash: Hash;
  updatedInDbo: boolean;
  isDirty: boolean;
  isLocked: boolean;
  hashExpired: boolean;
  hashExists: boolean;
  isHashDifferent: boolean;
  existOnDbo: boolean;
  existOnCache: boolean;
  userId: number;
  username: string;
  outcome: string;
  changes: SyncHistoryChangeModel[];

  constructor(data?: Partial<SyncHistoryDataSyncModel>) {
    Object.assign(this, data);
  }

  static deserialize(syncHistory: IAPISyncHistoryDataSync): SyncHistoryDataSyncModel {
    if (!syncHistory) {
      return new SyncHistoryDataSyncModel();
    }

    const data: Partial<SyncHistoryDataSyncModel> = {
      active: syncHistory.Active,
      jobId: syncHistory.JobId,
      dataSyncDate: syncHistory.DataSyncDate,
      syncType: syncHistory.SyncType == 0 ? 'Import' : 'Refresh',
      isOnHold: syncHistory.IsOnHold,
      cappsHash: syncHistory.CappsHash,
      currentHash: syncHistory.CurrentHash,
      updatedInDbo: syncHistory.UpdatedInDbo,
      isDirty: syncHistory.IsDirty,
      isLocked: syncHistory.IsLocked,
      hashExpired: syncHistory.HashExpired,
      hashExists: syncHistory.HashExists,
      isHashDifferent: syncHistory.IsHashDifferent,
      existOnDbo: syncHistory.ExistOnDbo,
      existOnCache: syncHistory.ExistOnCache,
      userId: syncHistory.UserId,
      username: syncHistory.Username,
      outcome: syncHistory.Outcome,
      changes: SyncHistoryChangeModel.deserializeList(syncHistory.Changes),
    };

    return new SyncHistoryDataSyncModel(data);
  }

  static deserializeList(syncHistory: IAPISyncHistoryDataSync[]): SyncHistoryDataSyncModel[] {
    return syncHistory
      ? syncHistory.map((syncHistorys: IAPISyncHistoryDataSync) =>
        SyncHistoryDataSyncModel.deserialize(syncHistorys)
      )
      : [];
  }
}
