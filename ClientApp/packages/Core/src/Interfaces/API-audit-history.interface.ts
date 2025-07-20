import { AuditHistoryModel } from '../Models';
import { IBaseApiResponse } from './BaseApiResponse.interface';

export interface IAPIAuditHistory extends IBaseApiResponse {
  event: string;
  changes: AuditHistoryModel[];
}
