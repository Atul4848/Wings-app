import { regex } from '@wings-shared/core';

export const fields = {
  permitAdditionalInfo: {
    fields: {
      permitIssuanceAuthority: { label: 'Permit Issuance Authority', rules: 'between:1,200' },
      appliedPermitPrerequisiteType: { label: 'Permit Prerequisites', value: [] },
      isBlanketAvailable: { label: 'Blanket Available' },
      appliedBlanketValidityType: { label: 'Blanket Validity', value: [] },
      appliedPermitDiplomaticType: { label: 'Diplomatic Channel Required for', value: [] },
      isDirectToCAA: { label: 'Direct to CAA Option' },
      isATCFollowUp: { label: 'ATC Follow Up Option' },
      isPermitNumberIssued: { label: 'Permit Number Issued' },
      appliedPermitNumberExceptionType: { label: 'Permit Number Issued Exceptions', value: [] },
      isBlanketPermitNumberIssued: { label: 'Blanket Permit Number Issued' },
      isShortNoticePermitAvailability: { label: 'Short Notice Permit Availability' },
      isRampCheckPossible: { label: 'Ramp Check Possible' },
      isFAOCRequired: { label: 'FAOC Required' },
      isHandlerCoordinationRequired: { label: 'Handler Coordination Required' },
      isRevisionAllowed: { label: 'Revisions Allowed' },
      // New fields
      isCAAPermitFeeApplied: { label: 'CAA Permit Fee Apply' },
      isPermitFeeNonRefundable: { label: 'Permit Fee Non-Refundable' },
      firstEntryNonAOE: { label: 'First Entry Non AOE Process', rules: 'string|between:0,1000' },
      isWindowPermitsAllowed: { label: 'Window Permits Allowed' },
      isOptionPermitsAllowed: { label: 'Option Permits Allowed' },
      isCharterAirTransportLicenseRequired: { label: 'Air Transport License Required for Charter' },
      isTemporaryImportationRequired: { label: 'Temporary Importation Required' },
      temporaryImportationTiming: {
        label: 'Temporary Importation Timing (atleast)',
        rules: `numeric|between:1,9999|regex:${regex.numberOnly}`,
      },
      temporaryImportation: { label: 'Temporary Importation Process', rules: 'string|between:0,1000' },
      isLandingPermitRqrdForAircraftRegisteredCountry: {
        label: 'Aircraft Registered in Country Require Landing Permit',
      },
    },
  },
};
