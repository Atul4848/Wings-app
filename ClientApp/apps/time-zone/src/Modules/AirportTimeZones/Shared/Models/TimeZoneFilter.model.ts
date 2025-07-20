import { modelProtection } from '@wings-shared/core';

@modelProtection
export class FilterRequestModel {
  id: string = '';
  icao: string = '';
  faaCode: string = '';

  constructor(data?: Partial<FilterRequestModel>) {
    Object.assign(this, data);
  }
}
