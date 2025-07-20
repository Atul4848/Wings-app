import { CoreModel, modelProtection, SettingsTypeModel, Utilities } from '@wings-shared/core';
import { IAPIPermitAdditionalInfo } from '../Interfaces';
import { RevisionTriggerModel } from './RevisionTrigger.model';

@modelProtection
export class PermitAdditionalInfoModel extends CoreModel {
  permitIssuanceAuthority: string = '';
  isBlanketAvailable: boolean = false;
  isDirectToCAA: boolean = null;
  isATCFollowUp: boolean = null;
  isPermitNumberIssued: boolean = null;
  isBlanketPermitNumberIssued: boolean = null;
  isShortNoticePermitAvailability: boolean = null;
  isRampCheckPossible: boolean = null;
  isFAOCRequired: boolean = null;
  appliedPermitNumberExceptionType: SettingsTypeModel[];
  appliedPermitDiplomaticType: SettingsTypeModel[];
  appliedPermitPrerequisiteType: SettingsTypeModel[];
  appliedBlanketValidityType: SettingsTypeModel[];
  isHandlerCoordinationRequired: boolean = null;
  isCAAPermitFeeApplied: boolean = false;
  isPermitFeeNonRefundable: boolean = false;
  firstEntryNonAOE: string;
  isWindowPermitsAllowed: boolean = null;
  isOptionPermitsAllowed: boolean = null;
  isCharterAirTransportLicenseRequired: boolean = null;
  isTemporaryImportationRequired: boolean = null;
  temporaryImportationTiming: number;
  temporaryImportation: string;
  isRevisionAllowed: boolean = false;
  isLandingPermitRqrdForAircraftRegisteredCountry: boolean = false;
  permitAdditionalInfoRevisions: RevisionTriggerModel[] = [];

  constructor(data?: Partial<PermitAdditionalInfoModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIPermitAdditionalInfo): PermitAdditionalInfoModel {
    if (!apiData) {
      return new PermitAdditionalInfoModel();
    }
    const data = new PermitAdditionalInfoModel({
      ...apiData,
      id: apiData.permitAdditionalInfoId || apiData.id,
      appliedPermitNumberExceptionType:
        apiData.appliedPermitNumberExceptionTypes?.map(a =>
          SettingsTypeModel.deserialize({
            ...a,
            id: a.permitNumberExceptionType?.permitNumberExceptionTypeId,
            name: a.permitNumberExceptionType?.name,
          })
        ) || [],
      appliedPermitDiplomaticType:
        apiData.appliedPermitDiplomaticTypes?.map(a =>
          SettingsTypeModel.deserialize({
            ...a,
            id: a.permitDiplomaticType?.permitDiplomaticTypeId,
            name: a.permitDiplomaticType?.name,
          })
        ) || [],
      appliedPermitPrerequisiteType:
        apiData.appliedPermitPrerequisiteTypes?.map(a =>
          SettingsTypeModel.deserialize({
            ...a,
            id: a.permitPrerequisiteType?.permitPrerequisiteTypeId,
            name: a.permitPrerequisiteType?.name,
          })
        ) || [],
      appliedBlanketValidityType:
        apiData.appliedBlanketValidityTypes?.map(a =>
          SettingsTypeModel.deserialize({
            ...a,
            id: a.blanketValidityType.blanketValidityTypeId,
            name: a.blanketValidityType.name,
          })
        ) || [],
      permitAdditionalInfoRevisions: RevisionTriggerModel.deserializeList(apiData.permitAdditionalInfoRevisions),
      isCAAPermitFeeApplied: apiData.isCAAPermitFeeApplied,
      isPermitFeeNonRefundable: apiData.isPermitFeeNonRefundable,
      firstEntryNonAOE: apiData.firstEntryNonAOE,
      isWindowPermitsAllowed: apiData.isWindowPermitsAllowed,
      isOptionPermitsAllowed: apiData.isOptionPermitsAllowed,
      isCharterAirTransportLicenseRequired: apiData.isCharterAirTransportLicenseRequired,
      isTemporaryImportationRequired: apiData.isTemporaryImportationRequired,
      temporaryImportationTiming: apiData.temporaryImportationTiming,
      temporaryImportation: apiData.temporaryImportation,
    });

    return data;
  }

  public serialize(): IAPIPermitAdditionalInfo {
    return {
      id: this.id || 0,
      statusId: this.status?.id,
      permitIssuanceAuthority: this.permitIssuanceAuthority,
      isBlanketAvailable: this.isBlanketAvailable,
      isDirectToCAA: this.isDirectToCAA,
      isATCFollowUp: this.isATCFollowUp,
      isPermitNumberIssued: this.isPermitNumberIssued,
      isBlanketPermitNumberIssued: this.isBlanketPermitNumberIssued,
      isShortNoticePermitAvailability: this.isShortNoticePermitAvailability,
      isRampCheckPossible: this.isRampCheckPossible,
      isFAOCRequired: this.isFAOCRequired,
      permitNumberExceptionTypeIds: this.appliedPermitNumberExceptionType?.map(a => a.id) || [],
      permitDiplomaticTypeIds: this.appliedPermitDiplomaticType?.map(a => a.id) || [],
      permitPrerequisiteTypeIds: this.appliedPermitPrerequisiteType?.map(a => a.id) || [],
      blanketValidityTypeIds: this.appliedBlanketValidityType?.map(a => a.id) || [],
      isHandlerCoordinationRequired: this.isHandlerCoordinationRequired,
      isCAAPermitFeeApplied: this.isCAAPermitFeeApplied,
      isPermitFeeNonRefundable: this.isPermitFeeNonRefundable,
      firstEntryNonAOE: this.firstEntryNonAOE,
      isWindowPermitsAllowed: this.isWindowPermitsAllowed,
      isOptionPermitsAllowed: this.isOptionPermitsAllowed,
      isCharterAirTransportLicenseRequired: this.isCharterAirTransportLicenseRequired,
      isTemporaryImportationRequired: this.isTemporaryImportationRequired,
      temporaryImportationTiming: Utilities.getNumberOrNullValue(this.temporaryImportationTiming),
      temporaryImportation: this.temporaryImportation,
      isRevisionAllowed: this.isRevisionAllowed,
      isLandingPermitRqrdForAircraftRegisteredCountry: this.isLandingPermitRqrdForAircraftRegisteredCountry,
      permitAdditionalInfoRevisions: this.permitAdditionalInfoRevisions?.map(revision => revision.serialize()),
    };
  }

  static deserializeList(apiDataList: IAPIPermitAdditionalInfo[]): PermitAdditionalInfoModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPermitAdditionalInfo) => PermitAdditionalInfoModel.deserialize(apiData))
      : [];
  }
}
