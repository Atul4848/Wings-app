import { modelProtection } from '@wings-shared/core';
import moment from 'moment';

@modelProtection
export class CSDProfileModel {
  userId: number;
  firstName: string = '';
  lastName: string = '';
  stageEmail: string = '';
  loginEmail: string = '';
  oktaImportDate: string = '';
  endDate: string = '';

  constructor(data?: Partial<CSDProfileModel>) {
    Object.assign(this, data);
  }

  static obfuscate(userId: number): CSDProfileModel{
    return new CSDProfileModel({
      userId: userId,
      firstName: 'XX',
      lastName: 'XX',
      endDate: moment().toISOString(),
    });
  }
}