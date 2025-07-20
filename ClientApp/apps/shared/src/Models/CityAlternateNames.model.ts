import { IAPICityAlternateNames } from '../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class CityAlternateNamesModel extends CoreModel {
  cityId: number = null;
  alternateName: string = '';

  constructor(data?: Partial<CityAlternateNamesModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiAlternateName: IAPICityAlternateNames): CityAlternateNamesModel {
    if (!apiAlternateName) {
      return new CityAlternateNamesModel();
    }
    const data: Partial<CityAlternateNamesModel> = {
      id: apiAlternateName.cityAlternateNameId || apiAlternateName.id,
      cityId: apiAlternateName.cityId,
      alternateName: apiAlternateName.alternateName,
    };
    return new CityAlternateNamesModel(data);
  }

  static deserializeList(apiResponse: IAPICityAlternateNames[]): CityAlternateNamesModel[] {
    return apiResponse
      ? apiResponse.map((apiPerson: IAPICityAlternateNames) => CityAlternateNamesModel.deserialize(apiPerson))
      : [];
  }
}
