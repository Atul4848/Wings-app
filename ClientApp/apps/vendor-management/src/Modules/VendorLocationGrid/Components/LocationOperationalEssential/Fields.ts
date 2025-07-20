import { regex } from '@wings-shared/core';
import { auditFields } from '@wings/shared';
import { VALIDATION_REGEX } from '../../../Shared/Enums/Spacing.enum';


export const fields = {
  ...auditFields,
  id: {
    label: 'Vendor Location Id',
  },
  coordinatingOffice: {
    label: 'Coordinating Office',
  },
  isSupervisoryAgentAvailable: {
    label: 'Supervisory Agent Available on Request',
  },
  agentDispatchedFrom: {
    label: 'Agent Dispatched From',
  },
  isPrincipleOffice: {
    label: 'Principal Office',
  },
  vendorLevel: {
    label: 'Vendor Level*',
    rules: 'required'
  },
  certifiedMemberFeeSchedule: {
    label: 'Certified Member Fee Schedule',
  },
  certifiedMemberFee: {
    label: 'Certified Member Fee',
    rules: 'numeric|between:0,999999.99'
  },
  contractRenewalDate: {
    label: 'Contract Renewal Date',
  },
  complianceDiligenceDueDate: {
    label: 'Compliance Due Diligence Due Date*',
    rules: 'required'
  },
  startDate: {
    label: 'Start Date*',
    rules: 'required'
  },
  endDate: {
    label: 'End Date',
  },
  isProprietary: {
    label: 'Is Proprietary',
  },
  netSuitId: {
    label: 'NetSuite ID',
    rules: 'numeric|between:0,999999'
  },
  creditProvidedBy: {
    label: 'Credit Provided By',
  },
  locationAirfield: {
    label: 'Location on Airfield',
    rules: `string|between:2,200|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`
  },
  airToGroundFrequency: {
    label: 'Air To Ground Frequency',
    rules: 'numeric|between:0,999.99999'
  },
  managerName: {
    label: 'Manager Name',
    rules: `string|between:2,100|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`
  },
  asstManagerName: {
    label: 'Asst Manager Name',
    rules: `string|between:2,100|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`
  },
  appliedOperationType: {
    label: 'Operation Type*',
    rules: 'required'
  },
  provideCoordinationFor: {
    label: 'Provides Coordination For',
  },
  commsCopyFor: {
    label: 'Comms Copy For',
  },
  customers: {
    label: 'Customer',
  },
  appliedPaymentOptions: {
    label: 'Payment Options',
  },
  appliedCreditAvailable: {
    label: 'Credit Available',
  },
  creditProvidedFor: {
    label: 'Credit Provided For',
  },
  appliedMainServicesOffered: {
    label: 'Main Services Offered*',
    rules: 'required'
  },
};
