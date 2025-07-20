import {
  CoreModel,
  SettingsTypeModel,
  modelProtection,
  IdNameCodeModel,
  EntityMapModel,
  Utilities,
} from '@wings-shared/core';
import { IAPICabotage, IAPICabotageRequest } from '../Interfaces';

@modelProtection
export class CabotageModel extends CoreModel {
  isCabotageEnforced: boolean = false;
  isImportationFeesforDomesticFlight: boolean = false;
  isCustomsStopsExempt: boolean = false;
  isPaxMustDepartwithSameOperator: boolean = false;
  isNoNewPaxAllowedtoDepart: boolean = false;
  isCabotageAppliestoLivestock: boolean = false;
  isCabotageAppliestoCargo: boolean = false;
  isCabotageAppliestoNonResidents: boolean = false;
  exemptionLevel: SettingsTypeModel = null;
  country: IdNameCodeModel;
  appliedRegionCabotageExemptions?: EntityMapModel[] = [];
  appliedCountryCabotageExemptions?: EntityMapModel[] = [];
  cabotageAssociatedEntities?: EntityMapModel[] = [];
  cabotageEnforcedForFARTypes: EntityMapModel[] = [];
  countryId?: number;

  constructor(data?: Partial<CabotageModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICabotage): CabotageModel {
    if (!apiData) {
      return new CabotageModel();
    }
    const data: Partial<CabotageModel> = {
      ...apiData,
      id: apiData.id,
      exemptionLevel: apiData.exemptionLevel
        ? SettingsTypeModel.deserialize({
          ...apiData.exemptionLevel,
          id: apiData.exemptionLevel.cabotageExemptionLevelId,
          name: apiData.exemptionLevel.name,
        })
        : null,
      country: IdNameCodeModel.deserialize({
        ...apiData.country,
        id: apiData.country.countryId,
        code: apiData.country.code,
        name: apiData.country.name,
      }),

      appliedCountryCabotageExemptions: apiData.appliedCountryCabotageExemptions?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedCountryCabotageExemptionId,
            entityId: entity.country.countryId,
            name: entity.country.name,
            code: entity.country.code,
          })
      ),
      appliedRegionCabotageExemptions: apiData.appliedRegionCabotageExemptions?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedRegionCabotageExemptionId,
            entityId: entity.region.regionId,
            name: entity.region.name,
            code: entity.region.code,
          })
      ),
      cabotageAssociatedEntities: Utilities.isEqual(apiData.exemptionLevel?.name.toLowerCase(), 'country')
        ? apiData.appliedCountryCabotageExemptions?.map(
            entity =>
              new EntityMapModel({
                id: entity.appliedCountryCabotageExemptionId,
                entityId: entity.country.countryId,
                name: entity.country.name,
                code: entity.country.code,
              })
          )
        : Utilities.isEqual(apiData.exemptionLevel?.name.toLowerCase(), 'region')
          ? apiData.appliedRegionCabotageExemptions?.map(
            entity =>
              new EntityMapModel({
                id: entity.appliedRegionCabotageExemptionId,
                entityId: entity.region.regionId,
                name: entity.region.name,
                code: entity.region.code,
              })
          )
          : [],
      cabotageEnforcedForFARTypes: apiData.cabotageEnforcedForFARTypes?.map(
        entity =>
          new EntityMapModel({
            id: entity.cabotageEnforcedForFARTypeId,
            entityId: entity.permitFarTypeId,
            name: entity.name,
            code: entity.cappsCode,
          })
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new CabotageModel(data);
  }

  static deserializeList(apiDataList: IAPICabotage[]): CabotageModel[] {
    return apiDataList ? apiDataList.map(apiData => CabotageModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): IAPICabotageRequest {
    return {
      id: this.id || 0,
      isCabotageEnforced: this.isCabotageEnforced,
      cabotageExemptionLevelId: this.exemptionLevel?.id || null,
      isImportationFeesforDomesticFlight: this.isImportationFeesforDomesticFlight,
      isCustomsStopsExempt: this.isCustomsStopsExempt,
      isPaxMustDepartwithSameOperator: this.isPaxMustDepartwithSameOperator,
      isNoNewPaxAllowedtoDepart: this.isNoNewPaxAllowedtoDepart,
      isCabotageAppliestoLivestock: this.isCabotageAppliestoLivestock,
      isCabotageAppliestoCargo: this.isCabotageAppliestoCargo,
      isCabotageAppliestoNonResidents: this.isCabotageAppliestoNonResidents,
      countryId: this.country?.id || this.countryId,
      appliedRegionCabotageExemptions: this.appliedRegionCabotageExemptions?.map(entity => {
        return {
          id: entity.id || 0,
          regionId: entity.entityId,
        };
      }),
      appliedCountryCabotageExemptions: this.appliedCountryCabotageExemptions?.map(entity => ({
        id: entity.id || 0,
        countryId: entity.entityId,
      })),
      cabotageEnforcedForFARTypes: this.cabotageEnforcedForFARTypes?.map(x => ({
        id: x.id,
        permitFARTypeId: x.entityId,
        name: x.name,
        cappsCode: x.code,
      })),
    };
  }
}