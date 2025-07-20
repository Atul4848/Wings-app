import { CountryModel } from '@wings/shared';
import { CoreModel, modelProtection, Utilities, EntityMapModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAircraftOperatorRestrictions, IAPIAircraftOperatorRestrictionsRequest } from '../Interfaces';

@modelProtection
export class AircraftOperatorRestrictionsModel extends CoreModel {
  id: number = 0;
  notamId: string = '';
  notamExpiryDate: string = '';
  startDate: string = '';
  endDate: string = '';
  link: string = '';
  summary: string = '';
  effectedEntityType: SettingsTypeModel;
  effectedEntity: EntityMapModel;
  nationalities: CountryModel[] = [];
  // Restriction Areas Applied To
  restrictionType: SettingsTypeModel;
  restrictionAppliedToLicenseHolder: boolean = false;
  restrictionAppliedToRegistries: boolean = false;
  restrictionAppliedToAllFlights: boolean = false;
  restrictionAppliedToOperators: boolean = false;
  restrictionAppliedToPassportedPassenger: boolean = false;
  exceptForeignOperators: boolean = false;
  sfc: boolean = false;
  unl: boolean = false;
  lowerLimitFL: number;
  upperLimitFL: number;
  // Restriction Source
  restrictionSource: SettingsTypeModel;
  restrictingCountry: CountryModel;
  restrictionSeverity: SettingsTypeModel;
  approvalTypeRequired: SettingsTypeModel;
  uwaAllowableActions: SettingsTypeModel;
  enforcementAgency: SettingsTypeModel;
  aircraftOperatorRestrictionForms: EntityMapModel[];
  uwaAllowableServices: EntityMapModel[];

  constructor(data?: Partial<AircraftOperatorRestrictionsModel>) {
    super(data);
    Object.assign(this, data);
    this.effectedEntityType = new SettingsTypeModel(data?.effectedEntityType);
    this.effectedEntity = new EntityMapModel(data?.effectedEntity);
    this.nationalities = data?.nationalities?.map(c => new CountryModel(c)) || [];
    this.restrictionType = new SettingsTypeModel(data?.restrictionType);
    this.restrictingCountry = new CountryModel(data?.restrictingCountry);
    this.restrictionSource = new SettingsTypeModel(data?.restrictionSource);
    this.restrictionSeverity = new SettingsTypeModel(data?.restrictionSeverity);
    this.approvalTypeRequired = new SettingsTypeModel(data?.approvalTypeRequired);
    this.uwaAllowableActions = new SettingsTypeModel(data?.uwaAllowableActions);
    this.enforcementAgency = new SettingsTypeModel(data?.enforcementAgency);
    this.aircraftOperatorRestrictionForms =
      data?.aircraftOperatorRestrictionForms?.map(a => new EntityMapModel(a)) || [];
    this.uwaAllowableServices = data?.uwaAllowableServices?.map(a => new EntityMapModel(a)) || [];
  }

  static deserialize(apiData: IAPIAircraftOperatorRestrictions): AircraftOperatorRestrictionsModel {
    if (!apiData) {
      return new AircraftOperatorRestrictionsModel();
    }
    const data: Partial<AircraftOperatorRestrictionsModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.aircraftOperatorRestrictionId || apiData.id,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      notamId: apiData.notamid,
      notamExpiryDate: apiData.notamExpiryDate,
      link: apiData.link,
      summary: apiData.summary,
      effectedEntityType: SettingsTypeModel.deserialize({
        ...apiData.effectedEntityType,
        id: apiData.effectedEntityType?.effectedEntityTypeId,
      }),
      effectedEntity: new EntityMapModel({
        entityId: apiData.effectedEntity?.effectedEntityId,
        code: apiData.effectedEntity?.code,
        name: apiData.effectedEntity?.name,
      }),
      nationalities: apiData.nationalities?.map(
        nationality =>
          new CountryModel({
            id: nationality.countryId,
            nationalityId: nationality.nationalityId,
            isO2Code: nationality.code,
            commonName: nationality.name,
          })
      ),
      restrictionType: SettingsTypeModel.deserialize({
        ...apiData.aircraftOperatorRestrictionType,
        id: apiData.aircraftOperatorRestrictionType?.aircraftOperatorRestrictionTypeId,
      }),
      restrictionAppliedToLicenseHolder: apiData.restrictionAppliedToLicenseHolder,
      restrictionAppliedToRegistries: apiData.restrictionAppliedToRegistries,
      restrictionAppliedToAllFlights: apiData.restrictionAppliedToAllFlights,
      restrictionAppliedToOperators: apiData.restrictionAppliedToOperators,
      restrictionAppliedToPassportedPassenger: apiData.restrictionAppliedToPassportedPassenger,
      sfc: apiData.sfc,
      unl: apiData.unl,
      lowerLimitFL: apiData.lowerLimitFL,
      upperLimitFL: apiData.upperLimitFL,
      exceptForeignOperators: apiData.exceptForeignOperators,
      // Restriction Source
      restrictingCountry: new CountryModel({
        id: apiData.restrictingCountry?.restrictingCountryId,
        isO2Code: apiData.restrictingCountry?.code,
        commonName: apiData.restrictingCountry?.name,
      }),
      restrictionSource: SettingsTypeModel.deserialize({
        ...apiData.restrictionSource,
        id: apiData.restrictionSource?.restrictionSourceId,
      }),
      restrictionSeverity: SettingsTypeModel.deserialize({
        ...apiData.restrictionSeverity,
        id: apiData.restrictionSeverity?.restrictionSeverityId,
      }),
      approvalTypeRequired: SettingsTypeModel.deserialize({
        ...apiData.approvalTypeRequired,
        id: apiData.approvalTypeRequired?.approvalTypeRequiredId,
      }),
      uwaAllowableActions: SettingsTypeModel.deserialize({
        ...apiData.uwaAllowableAction,
        id: apiData.uwaAllowableAction?.uwaAllowableActionId,
      }),
      enforcementAgency: SettingsTypeModel.deserialize({
        ...apiData.enforcementAgency,
        id: apiData.enforcementAgency?.enforcementAgencyId,
      }),
      aircraftOperatorRestrictionForms: apiData?.aircraftOperatorRestrictionForms?.map(
        x =>
          new EntityMapModel({
            id: x.aircraftOperatorRestrictionFormId,
            entityId: x.restrictionForm?.restrictionFormId,
            name: x.restrictionForm?.name,
          })
      ),
      uwaAllowableServices: apiData?.aircraftOperatorRestrictionUWAAllowableServices?.map(
        x =>
          new EntityMapModel({
            id: x.aircraftOperatorRestrictionUWAAllowableServiceId,
            entityId: x.uwaAllowableService?.uwaAllowableServiceId,
            name: x.uwaAllowableService?.name,
          })
      ),
    };
    return new AircraftOperatorRestrictionsModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAircraftOperatorRestrictionsRequest {
    return {
      id: this.id || 0,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      effectedEntityTypeId: this.effectedEntityType?.id, // Country / FIR / State etc
      effectedEntityId: Utilities.getNumberOrNullValue(this.effectedEntity?.entityId), // country id
      effectedEntityCode: this.effectedEntity?.code, // country code
      effectedEntityName: this.effectedEntity?.name, // country name
      aircraftOperatorRestrictionTypeId: this.restrictionType?.id,
      restrictionAppliedToLicenseHolder: this.restrictionAppliedToLicenseHolder || false,
      restrictionAppliedToRegistries: this.restrictionAppliedToRegistries || false,
      restrictionAppliedToAllFlights: this.restrictionAppliedToAllFlights || false,
      restrictionAppliedToOperators: this.restrictionAppliedToOperators || false,
      restrictionAppliedToPassportedPassenger: this.restrictionAppliedToPassportedPassenger || false,
      sfc: this.sfc || false,
      unl: this.unl || false,
      lowerLimitFL: parseInt(this.lowerLimitFL),
      upperLimitFL: parseInt(this.upperLimitFL),
      exceptForeignOperators: this.exceptForeignOperators || false,
      restrictionSourceId: this.restrictionSource?.id || null,
      restrictingCountryId: this.restrictingCountry?.id || null,
      restrictingCountryCode: this.restrictingCountry?.isO2Code || null,
      restrictingCountryName: this.restrictingCountry?.commonName || null,
      restrictionSeverityId: this.restrictionSeverity?.id || null,
      approvalTypeRequiredId: this.approvalTypeRequired?.id || null,
      uwaAllowableActionId: this.uwaAllowableActions?.id || null,
      enforcementAgencyId: this.enforcementAgency?.id || null,
      notamid: this.notamId,
      notamExpiryDate: this.notamExpiryDate || null,
      link: this.link || null,
      nationalities: this.nationalities?.map(c => {
        return {
          nationalityId: c.nationalityId || 0,
          countryId: c.id,
          code: c.isO2Code, // nationalityCode
          name: c.commonName,
        };
      }),
      aircraftOperatorRestrictionForms: this.aircraftOperatorRestrictionForms?.map(x => {
        return { aircraftOperatorRestrictionFormId: x.id, restrictionFormId: x.entityId };
      }),
      aircraftOperatorRestrictionUWAAllowableServices: this.uwaAllowableServices?.map(x => {
        return { aircraftOperatorRestrictionUWAAllowableServiceId: x.id, uwaAllowableServiceId: x.entityId };
      }),
      ...this._serialize(),
    };
  }

  static deserializeList(apiDataList: IAPIAircraftOperatorRestrictions[]): AircraftOperatorRestrictionsModel[] {
    return apiDataList ? apiDataList.map(apiData => AircraftOperatorRestrictionsModel.deserialize(apiData)) : [];
  }
}
