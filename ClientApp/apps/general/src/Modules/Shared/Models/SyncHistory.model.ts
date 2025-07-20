import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPISyncHistoryResponse } from '../Interfaces';
import { SyncHistoryDataSyncModel } from '../Models';

@modelProtection
export class SyncHistoryModel extends CoreModel {
  tripNumber: number;
  tripId: number;
  creationDate: Date;
  folderStatus: string;
  dataSyncs: SyncHistoryDataSyncModel[];

  constructor(data?: Partial<SyncHistoryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(syncHistory: IAPISyncHistoryResponse): SyncHistoryModel {
    if (!syncHistory) {
      return new SyncHistoryModel();
    }

    const data: Partial<SyncHistoryModel> = {
      tripNumber: syncHistory.TripNumber,
      tripId: syncHistory.TripId,
      creationDate: syncHistory.CreationDate,
      folderStatus: syncHistory.FolderStatus,
      dataSyncs: SyncHistoryDataSyncModel.deserializeList(syncHistory.DataSyncs),
    };

    return new SyncHistoryModel(data);
  }

  static deserializeList(syncHistory: IAPISyncHistoryResponse[]): SyncHistoryModel[] {
    return syncHistory
      ? syncHistory.map((syncHistorys: IAPISyncHistoryResponse) => SyncHistoryModel.deserialize(syncHistorys))
      : [];
  }
}
