import { IBaseApiResponse } from './BaseApiResponse.interface';

export interface IAPIIdNameCode extends IBaseApiResponse {
  code: string;
  icaoCode?: string;
  icaoCodeId?: number;
}
