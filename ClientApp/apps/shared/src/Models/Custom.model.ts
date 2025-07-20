import { CoreModel, modelProtection, IdNameCodeModel, SettingsTypeModel, EntityMapModel } from '@wings-shared/core';
import { IAPICustom } from '../Interfaces';

@modelProtection
export class CustomModel extends CoreModel {
  isAlcoholClearanceAllowed: boolean = false;
  allowableAlcoholClearance: number = null;
  isDisinsectionRequired: boolean = false;
  isAPISRequired: boolean = false;
  apisSubmissionAddress: string = '';
  apisFormat: string = '';
  declarationRequiredForCash: number = null;
  isWeaponsOnBoardAllowed: boolean = false;
  countryId?: number;
  country: IdNameCodeModel;
  apisSubmission: SettingsTypeModel = null;
  declarationRequiredForCashCurrency: SettingsTypeModel = null;
  isAllDisinsectionDeparture: boolean = false;
  isDisinfectionRequired: boolean = false;
  isDocumentationRequired: boolean = false;
  formURL: string = '';
  weaponsOnBoardRequiredDocuments: EntityMapModel[] = [];
  weaponOnBoardVendors: EntityMapModel[] = [];
  appliedDisinsectionDepartureCountries: EntityMapModel[] = [];
  appliedWeaponInformations: EntityMapModel[] = [];
  appliedDisinsectionTypes: EntityMapModel[] = [];
  appliedDisinsectionChemicals: EntityMapModel[] = [];
  appliedAPISRequirements: EntityMapModel[] = [];

  constructor(data?: Partial<CustomModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustom): CustomModel {
    if (!apiData) {
      return new CustomModel();
    }
    const data: Partial<CustomModel> = {
      ...apiData,
      country: IdNameCodeModel.deserialize({
        ...apiData.country,
        id: apiData.country.countryId,
        name: apiData.country.name,
        code: apiData.country.code,
      }),
      apisSubmission: apiData.apisSubmission
        ? SettingsTypeModel.deserialize({
          ...apiData.apisSubmission,
          id: apiData.apisSubmission.apisSubmissionId,
          name: apiData.apisSubmission.name,
        })
        : null,
      declarationRequiredForCashCurrency: apiData.declarationRequiredForCashCurrency
        ? SettingsTypeModel.deserialize({
          ...apiData.declarationRequiredForCashCurrency,
          id: apiData.declarationRequiredForCashCurrency.declarationRequiredForCashCurrencyId,
          name: apiData.declarationRequiredForCashCurrency.name,
        })
        : null,
      weaponsOnBoardRequiredDocuments: apiData.weaponsOnBoardRequiredDocuments.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.weaponsOnBoardRequiredDocumentId,
            entityId: entity.permitDocumentId,
            name: entity.name,
            code: entity.code,
          })
      ),
      weaponOnBoardVendors: apiData.weaponOnBoardVendors.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.weaponOnBoardVendorId,
            entityId: entity.vendorId,
          })
      ),
      appliedDisinsectionDepartureCountries: apiData.isAllDisinsectionDeparture
        ? []
        : apiData.appliedDisinsectionDepartureCountries.map(
          entity =>
            new EntityMapModel({
              ...entity,
              id: entity.appliedDisinsectionDepartureCountryId,
              entityId: entity.country.countryId,
              name: entity.country.name || entity.country.code,
              code: entity.country.code,
            })
        ),
      appliedWeaponInformations: apiData.appliedWeaponInformations.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.appliedWeaponInformationId,
            entityId: entity.weaponInformation.weaponInformationId,
            name: entity.weaponInformation.name,
          })
      ),
      appliedDisinsectionTypes: apiData.appliedDisinsectionTypes.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.appliedDisinsectionTypeId,
            entityId: entity.disinsectionType.disinsectionTypeId,
            name: entity.disinsectionType.name,
          })
      ),
      appliedDisinsectionChemicals: apiData.appliedDisinsectionChemicals.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.appliedDisinsectionChemicalId,
            entityId: entity.disinsectionChemical.disinsectionChemicalId,
            name: entity.disinsectionChemical.name,
          })
      ),
      appliedAPISRequirements: apiData.appliedAPISRequirements.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.appliedAPISRequirementId,
            entityId: entity.apisRequirement.apisRequirementId,
            name: entity.apisRequirement.name,
          })
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new CustomModel(data);
  }

  static deserializeList(apiDataList: IAPICustom[]): CustomModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomModel.deserialize(apiData)) : [];
  }

  public serialize() {
    return {
      id: this.id || 0,
      countryId: this.country?.id || this.countryId,
      isAlcoholClearanceAllowed: this.isAlcoholClearanceAllowed,
      allowableAlcoholClearance: Number(this.allowableAlcoholClearance) || null,
      isDisinsectionRequired: this.isDisinsectionRequired,
      isAPISRequired: this.isAPISRequired,
      apisSubmissionAddress: this.apisSubmissionAddress,
      apisFormat: this.apisFormat,
      declarationRequiredForCash: Number(this.declarationRequiredForCash) || null,
      isWeaponsOnBoardAllowed: this.isWeaponsOnBoardAllowed,
      apisSubmissionMethodId: this.apisSubmission?.id || null,
      declarationRequiredForCashCurrencyId: this.declarationRequiredForCashCurrency?.id || null,
      isAllDisinsectionDeparture: this.isAllDisinsectionDeparture,
      isDisinfectionRequired: this.isDisinfectionRequired,
      isDocumentationRequired: this.isDocumentationRequired,
      formURL: this.formURL,
      weaponsOnBoardRequiredDocuments: this.weaponsOnBoardRequiredDocuments?.map(x => ({
        id: x.id || 0,
        permitDocumentId: x.entityId,
        name: x.name,
        code: x.code,
      })),
      weaponOnBoardVendors: this.weaponOnBoardVendors?.map(x => ({
        id: x.id || 0,
        vendorId: x.entityId,
        name: x.name,
        code: x.code,
      })),
      weaponInformations: this.appliedWeaponInformations?.map(x => ({
        id: x.id || 0,
        weaponInformationId: x.entityId,
      })),
      disinsectionDepartureCountries: this.appliedDisinsectionDepartureCountries?.map(x => ({
        id: x.id || 0,
        disinsectionDepartureCountryId: x.entityId,
      })),
      disinsectionRequiredTypes: this.appliedDisinsectionTypes?.map(x => ({
        id: x.id || 0,
        disinsectionRequiredTypeId: x.entityId,
      })),
      disinsectionChemicals: this.appliedDisinsectionChemicals?.map(x => ({
        id: x.id || 0,
        disinsectionChemicalId: x.entityId,
      })),
      apisRequirements: this.appliedAPISRequirements?.map(x => ({
        id: x.id || 0,
        apisRequirementId: x.entityId,
      })),
    };
  }
}
