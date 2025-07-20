import { IAPISyncHistoryDataSync } from './API-SyncHistoryDataSync.interface';

export interface IAPISyncHistoryResponse {
  TripNumber: number;
  TripId: number;
  CreationDate: Date;
  FolderStatus: string;
  DataSyncs: IAPISyncHistoryDataSync[];
}
