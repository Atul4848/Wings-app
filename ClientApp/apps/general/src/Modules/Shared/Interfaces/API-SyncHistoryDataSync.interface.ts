import { Hash } from 'crypto';
import { IAPISyncHistoryChange } from './API-SyncHistoryChanges.interface';

export interface IAPISyncHistoryDataSync {
  Active: boolean;
  JobId: number;
  DataSyncDate: Date;
  SyncType: number;
  IsOnHold: boolean;
  CappsHash: Hash;
  CurrentHash: Hash;
  UpdatedInDbo: boolean;
  IsDirty: boolean;
  IsLocked: boolean;
  HashExpired: boolean;
  HashExists: boolean;
  IsHashDifferent: boolean;
  ExistOnDbo: boolean;
  ExistOnCache: boolean;
  UserId: number;
  Username: string;
  Outcome: string;
  Changes: IAPISyncHistoryChange[];
}
