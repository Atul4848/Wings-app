import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIDMNote extends IBaseApiResponse {
  permitId:number;
  dmNote: string;
  permitDMNoteId?:number,
}
