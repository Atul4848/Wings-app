import { modelProtection, CoreModel, IdNameCodeModel } from '@wings-shared/core';
import { IAPIPassportNationality } from '../Interfaces';
import { CountryModel } from '@wings/shared';

@modelProtection
export class PassportNationalityModel extends CoreModel {
  country: IdNameCodeModel;
  description: string;
  passportNationalityCode: string;

  constructor(data?: Partial<PassportNationalityModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIPassportNationality): PassportNationalityModel {
    if (!apiData) {
      return new PassportNationalityModel();
    }
    const data: Partial<PassportNationalityModel> = {
      ...apiData,
      country: IdNameCodeModel.deserialize({
        id: apiData?.countryId || 0,
        name: apiData?.countryName || '',
        code: apiData?.countryCode || '',
      }),
      ...this.deserializeAuditFields(apiData),
    };
    return new PassportNationalityModel(data);
  }

  static deserializeList(apiDataList: IAPIPassportNationality[]): PassportNationalityModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPassportNationality) => PassportNationalityModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIPassportNationality {
    return {
      id: this.id,
      countryId: this.country?.id ?? 0,
      countryName: this.country?.name ?? null,
      countryCode: this.country?.code ?? null,
      description: this.description,
      passportNationalityCode: this.passportNationalityCode,
      ...this._serialize(),
    };
  }
}
