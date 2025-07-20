import { CoreModel, EntityMapModel, modelProtection } from '@wings-shared/core';
import { IAPIGeneral, IAPIGeneralRequest } from '../Interfaces';
import { CountryModel } from './Country.model';

@modelProtection
export class GeneralModel extends CoreModel {
  domesticCountries: CountryModel[] = [];
  charterMaxLiquidInML: number = null;
  isMedicalInsuranceRecommended: boolean = false;
  navigators: EntityMapModel[] = [];
  fullAviationSecurityCheckRqrdOnDepartures: EntityMapModel[] = [];
  countryId?: number = null;
  businessDays?: EntityMapModel[] = [];

  constructor(data?: Partial<GeneralModel>) {
    super(data);
    Object.assign(this, data);
    this.domesticCountries = data?.domesticCountries?.map(x => new CountryModel(x)) || [];
  }

  static deserialize(apiData: IAPIGeneral): GeneralModel {
    if (!apiData) {
      return new GeneralModel();
    }
    const data: Partial<GeneralModel> = {
      ...apiData,
      navigators: apiData.navigators?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedNavigatorId,
            entityId: entity.navigator.navigatorId,
            name: entity.navigator.name,
          })
      ),
      domesticCountries: apiData.domesticCountries?.map(
        x => new CountryModel({ referenceId: x.id, id: x.countryId, commonName: x.name, isO2Code: x.code })
      ),
      fullAviationSecurityCheckRqrdOnDepartures: apiData.fullAviationSecurityCheckRqrdOnDepartures?.map(
        entity =>
          new EntityMapModel({
            id: entity.fullAviationSecurityCheckRqrdOnDepartureId,
            entityId: entity.flightOperationalCategoryId,
            name: entity.name,
          })
      ),
      businessDays: apiData.businessDays?.map(
        entity =>
          new EntityMapModel({
            entityId: entity.dayOfWeekId,
            name: entity.name,
          })
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new GeneralModel(data);
  }

  static deserializeList(apiDataList: IAPIGeneral[]): GeneralModel[] {
    return apiDataList ? apiDataList.map(apiData => GeneralModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IAPIGeneralRequest {
    return {
      id: this.id || 0,
      countryId: this.countryId,
      domesticCountries: this.domesticCountries?.map(domesticCountries => domesticCountries.id),
      charterMaxLiquidInML: Number(this.charterMaxLiquidInML),
      isMedicalInsuranceRecommended: this.isMedicalInsuranceRecommended,
      navigators: this.navigators?.map(entity => {
        return {
          id: entity.id || 0,
          navigatorId: entity.entityId,
        };
      }),
      fullAviationSecurityCheckRqrdOnDepartures: this.fullAviationSecurityCheckRqrdOnDepartures.map(entity => {
        return {
          id: entity.id || 0,
          flightOperationalCategoryId: entity.entityId,
          name: entity.name,
        };
      }),
      businessDays: this.businessDays.length ? this.businessDays?.map(entity => entity.entityId) : null,
    };
  }
}
