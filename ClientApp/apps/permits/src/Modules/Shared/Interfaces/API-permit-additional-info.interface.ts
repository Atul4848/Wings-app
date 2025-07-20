import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRevisionTrigger } from './API-revision-trigger.interface';

export interface IAPIPermitAdditionalInfo extends IBaseApiResponse {
  permitAdditionalInfoId?: number;
  permitIssuanceAuthority: string;
  isBlanketAvailable: boolean;
  isDirectToCAA: boolean;
  isATCFollowUp: boolean;
  isPermitNumberIssued: boolean;
  isBlanketPermitNumberIssued: boolean;
  isShortNoticePermitAvailability: boolean;
  isRampCheckPossible: boolean;
  isFAOCRequired: boolean;
  permitId?: number;
  appliedPermitNumberExceptionTypes?: IAPIAppliedPermitNumberExceptionType[];
  appliedPermitDiplomaticTypes?: IAPIAppliedPermitDiplomaticType[];
  appliedPermitPrerequisiteTypes?: IAPIAppliedPermitPrerequisiteType[];
  appliedBlanketValidityTypes?: IAPIAppliedBlanketValidityType[];
  permitNumberExceptionTypeIds: number[];
  permitDiplomaticTypeIds: number[];
  permitPrerequisiteTypeIds: number[];
  blanketValidityTypeIds: number[];
  isHandlerCoordinationRequired: boolean;
  isRevisionAllowed?: boolean;
  isLandingPermitRqrdForAircraftRegisteredCountry?: boolean;
  permitAdditionalInfoRevisions: IAPIRevisionTrigger[];
  // New Fields
  isCAAPermitFeeApplied?: boolean;
  isPermitFeeNonRefundable?: boolean;
  firstEntryNonAOE?: string;
  isWindowPermitsAllowed?: boolean;
  isOptionPermitsAllowed?: boolean;
  isCharterAirTransportLicenseRequired: boolean;
  isTemporaryImportationRequired?: boolean;
  temporaryImportationTiming?: number;
  temporaryImportation?: string;
}

interface IAPIAppliedPermitNumberExceptionType extends IBaseApiResponse {
  permitNumberExceptionTypeId: number;
  permitNumberExceptionType?: {
    permitNumberExceptionTypeId: number;
    name: string;
  };
}

interface IAPIAppliedPermitDiplomaticType extends IBaseApiResponse {
  permitDiplomaticTypeId: number;
  permitDiplomaticType?: {
    permitDiplomaticTypeId: number;
    name: string;
  };
}

interface IAPIAppliedPermitPrerequisiteType extends IBaseApiResponse {
  permitPrerequisiteTypeId: number;
  permitPrerequisiteType?: {
    permitPrerequisiteTypeId: number;
    name: string;
  };
}

interface IAPIAppliedBlanketValidityType extends IBaseApiResponse {
  blanketValidityTypeId: number;
  blanketValidityType?: {
    blanketValidityTypeId: number;
    name: string;
  };
}
