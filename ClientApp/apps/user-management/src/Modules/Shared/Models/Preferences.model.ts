import { modelProtection } from '@wings-shared/core';
import { IPreferencesResponse } from '../Interfaces';

@modelProtection
export class PreferencesModel {
  key: string = '';
  value: string = '';

  constructor(data?: Partial<PreferencesModel>) {
    Object.assign(this, data);
  }

  static deserialize(user: IPreferencesResponse): PreferencesModel {
    if (!user) {
      return new PreferencesModel();
    }

    const data: Partial<PreferencesModel> = {
      key: user.Key,
      value: user.Value,
    };

    return new PreferencesModel(data);
  }

  static deserializeList(profiles: IPreferencesResponse[]): PreferencesModel[] {
    return profiles
      ? profiles.map((user: IPreferencesResponse) => PreferencesModel.deserialize(user))
      : [];
  }
}
