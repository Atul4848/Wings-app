import { CountryModel } from '@wings/shared';
import {
  CoreModel,
  ISelectOption,
  modelProtection,
  Utilities,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import { AUTHORIZATION_LEVEL } from '../Enums';
import {
  IApiHealthAuthNationalities,
  IAPIHealthAuthorizationOverview,
  IApiHealthAuthTravelledCountries,
} from '../Interfaces';

@modelProtection
export class HealthAuthorizationOverviewModel extends CoreModel implements ISelectOption {
  id: number = 0;
  authorizationLevelEntityId: number = null;
  authorizationLevelEntityCode: string = '';
  isAllTraveledCountries: boolean = false;
  isAllNationalities: boolean = false;
  authorizationLevel: SettingsTypeModel;
  infectionType: SettingsTypeModel;
  affectedType: SettingsTypeModel;
  levelDesignator: IdNameCodeModel;
  healthAuthTraveledCountries: CountryModel[] = [];
  healthAuthNationalities: CountryModel[] = [];
  healthAuthorizationExcludedTraveledCountries: CountryModel[] = [];
  healthAuthorizationExcludedNationalities: CountryModel[] = [];
  receivedBy: string = '';
  receivedDate: string = '';
  requestedBy: string = '';
  requestedDate: string = '';
  isSuspendNotification: boolean = false;
  region: IdNameCodeModel;
  statusChangeReason: string = '';
  healthAuthorizationCloneId: number = 0;
  parentId: number = 0;
  daysCountToReceivedDate: number = 0;
  daysCountToRequestedDate: number = 0;

  constructor(data?: Partial<HealthAuthorizationOverviewModel>) {
    super(data);
    Object.assign(this, data);
    this.authorizationLevel = new SettingsTypeModel(data?.authorizationLevel);
    this.infectionType = new SettingsTypeModel(data?.infectionType);
    this.affectedType = new SettingsTypeModel(data?.affectedType);
    this.levelDesignator = new IdNameCodeModel(data?.levelDesignator);
    this.region = new IdNameCodeModel(data?.region);
    this.healthAuthTraveledCountries = data?.healthAuthTraveledCountries?.map(x => new CountryModel(x)) || [];
    this.healthAuthNationalities = data?.healthAuthNationalities?.map(x => new CountryModel(x)) || [];
    this.healthAuthorizationExcludedTraveledCountries =
      data?.healthAuthorizationExcludedTraveledCountries?.map(x => new CountryModel(x)) || [];
  }

  static deserialize(apiData: IAPIHealthAuthorizationOverview): HealthAuthorizationOverviewModel {
    if (!apiData) {
      return new HealthAuthorizationOverviewModel();
    }
    const data: Partial<HealthAuthorizationOverviewModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.healthAuthorizationId || apiData.id,
      authorizationLevel: SettingsTypeModel.deserialize({
        ...apiData.authorizationLevel,
        id: apiData.authorizationLevel?.authorizationLevelId,
      }),
      infectionType: SettingsTypeModel.deserialize({
        ...apiData.infectionType,
        id: apiData.infectionType?.infectionTypeId,
      }),
      affectedType: SettingsTypeModel.deserialize({
        ...apiData.affectedType,
        id: apiData.affectedType?.affectedTypeId,
      }),
      region: this.getNationalitiesRegion(apiData),
      levelDesignator: this.getLevelDesignator(apiData),
      healthAuthTraveledCountries: apiData.isAllTraveledCountries
        ? [ new CountryModel({ id: Utilities.getTempId(true), isO2Code: 'All' }) ]
        : apiData.healthAuthorizationTraveledCountries?.map(
            c =>
              new CountryModel({
                id: c.countryId || c.travelCountryId,
                isO2Code: c.code || c.travelCountryCode,
                name: c.name,
              })
          ),
      healthAuthNationalities: apiData.isAllNationalities
        ? [ new CountryModel({ id: Utilities.getTempId(true), isO2Code: 'All' }) ]
        : apiData.healthAuthorizationNationalities?.map(
            c =>
              new CountryModel({
                id: c.countryId || c.nationalityCountryId,
                isO2Code: c.code || c.nationalityCountryCode,
                name: c.name,
              })
          ),
      healthAuthorizationExcludedTraveledCountries: apiData.healthAuthorizationExcludedTraveledCountries?.map(
        c =>
          new CountryModel({
            id: c.countryId || c.travelCountryId,
            isO2Code: c.code || c.travelCountryCode,
          })
      ),
      healthAuthorizationExcludedNationalities: apiData.healthAuthorizationExcludedNationalities
        ? apiData.healthAuthorizationExcludedNationalities?.map(
            c =>
              new CountryModel({
                id: c.countryId || c.nationalityCountryId,
                isO2Code: c.code || c.nationalityCountryCode,
                name: c.name,
              })
          )
        : [],
    };
    return new HealthAuthorizationOverviewModel(data);
  }

  private static getNationalitiesRegion(apiData): IdNameCodeModel {
    const _region = apiData.healthAuthorizationNationalitiesRegion;
    if (!_region) {
      return new IdNameCodeModel();
    }
    return IdNameCodeModel.deserialize({
      id: _region.id || _region.regionId,
      name: _region.name || _region.regionName,
      code: _region.code || _region.regionCode,
    });
  }

  private static getLevelDesignator(apiData: IAPIHealthAuthorizationOverview): IdNameCodeModel {
    const { authorizationLevel, authorizationLevelEntityId, authorizationLevelEntityCode } = apiData;
    let levelDesignator: IdNameCodeModel;
    switch (authorizationLevel.name) {
      case AUTHORIZATION_LEVEL.COUNTRY:
        levelDesignator = IdNameCodeModel.deserialize({
          ...authorizationLevel?.country,
          id: authorizationLevel?.country?.countryId || authorizationLevelEntityId,
          name: authorizationLevel.country?.name,
          code: authorizationLevel.country?.code || authorizationLevelEntityCode,
        });
        break;
      case AUTHORIZATION_LEVEL.AIRPORT:
        levelDesignator = IdNameCodeModel.deserialize({
          ...authorizationLevel?.airport,
          id: authorizationLevel.airport?.airportId || authorizationLevelEntityId,
          name: authorizationLevel.airport?.name,
          code: authorizationLevel.airport?.code || authorizationLevelEntityCode,
        });
        break;
      case AUTHORIZATION_LEVEL.STATE:
        levelDesignator = IdNameCodeModel.deserialize({
          ...authorizationLevel?.state,
          id: authorizationLevel?.state?.stateId || authorizationLevelEntityId,
          name: authorizationLevel.state?.name,
          code: authorizationLevel.state?.code || authorizationLevelEntityCode,
        });
        break;
    }
    return levelDesignator;
  }

  public serialize(): IAPIHealthAuthorizationOverview {
    return {
      id: this.id,
      sourceTypeId: this.sourceType?.id,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      affectedTypeId: this.affectedType?.id,
      infectionTypeId: this.infectionType?.id,
      authorizationLevelId: this.authorizationLevel?.id,
      levelDesignatorId: this.levelDesignator?.id,
      isAllTraveledCountries: this.isAllTraveled(),
      isAllNationalities: this.isAllNationalties(),
      authorizationLevelEntityCode: this.authorizationLevelEntityCode,
      authorizationLevelEntityId: Utilities.getNumberOrNullValue(this.authorizationLevelEntityId) || 0,
      healthAuthorizationNationalities: this.getNationalties(),
      healthAuthorizationNationalitiesRegion: Boolean(this.region?.id)
        ? {
          regionId: this.region?.id,
          regionName: this.region?.name,
          regionCode: this.region?.code,
        }
        : null,
      healthAuthorizationTraveledCountries: this.getTraveledCountries(),
      healthAuthorizationExcludedNationalities: this.getNationaltiesExcluded() || [],
      healthAuthorizationExcludedTraveledCountries: this.getTraveledCountriesExcluded() || [],
      receivedBy: this.receivedBy,
      receivedDate: this.receivedDate || null,
      requestedDate: this.requestedDate || null,
      requestedBy: this.requestedBy,
      isSuspendNotification: this.isSuspendNotification,
      statusChangeReason: this.statusChangeReason,
      healthAuthorizationCloneId: this.healthAuthorizationCloneId,
      daysCountToReceivedDate: this.daysCountToReceivedDate,
      daysCountToRequestedDate: this.daysCountToRequestedDate,
    };
  }

  private isAllTraveled(): boolean {
    return this.healthAuthTraveledCountries?.some(x => x.isO2Code === 'All');
  }

  private isAllNationalties(): boolean {
    return this.healthAuthNationalities?.some(x => x.isO2Code === 'All');
  }

  private getNationalties(): IApiHealthAuthNationalities[] {
    return this.isAllNationalties()
      ? []
      : this.healthAuthNationalities?.map(x => ({
        ...x.serialize(),
        healthAuthorizationId: this.id,
        nationalityCountryId: x.id,
        nationalityCountryCode: x.isO2Code,
      }));
  }

  private getTraveledCountries(): IApiHealthAuthTravelledCountries[] {
    return this.isAllTraveled()
      ? []
      : this.healthAuthTraveledCountries?.map(x => ({
        ...x.serialize(),
        healthAuthorizationId: this.id,
        travelCountryId: x.id,
        travelCountryCode: x.isO2Code,
      }));
  }

  private getNationaltiesExcluded(): IApiHealthAuthNationalities[] {
    return this.healthAuthorizationExcludedNationalities?.map(x => ({
      ...x.serialize(),
      healthAuthorizationId: this.id,
      nationalityCountryId: x.id,
      nationalityCountryCode: x.isO2Code,
    }));
  }

  private getTraveledCountriesExcluded(): IApiHealthAuthTravelledCountries[] {
    return this.healthAuthorizationExcludedTraveledCountries?.map(x => ({
      ...x.serialize(),
      healthAuthorizationId: this.id,
      travelCountryId: x.id,
      travelCountryCode: x.isO2Code,
    }));
  }

  static deserializeList(apiDataList: IAPIHealthAuthorizationOverview[]): HealthAuthorizationOverviewModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIHealthAuthorizationOverview) =>
        HealthAuthorizationOverviewModel.deserialize(apiData)
      )
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
