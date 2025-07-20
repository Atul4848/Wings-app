import { auditFields } from '@wings/shared';

export const intlFields = {
  ...auditFields,
  vipProcessingAvailable: {
    label: 'VIP Processing Available',
  },
  overtimeAllowed: {
    label: 'Overtime Allowed',
  },
  overtimeRequirements: {
    label: 'Overtime Requirements',
    rules: 'max:500',
  },
  taxRefundAvailable: {
    label: 'Tax Refund Available',
  },
  taxRefundInstructions: {
    label: 'Tax Refund Instructions',
    rules: 'max:200',
  },
  cargoClearanceAvailable: {
    label: 'Cargo Clearance Available',
  },
  quarantineInfo: {
    fields: {
      agricultureAvailable: {
        label: 'Agriculture Or Quarantine Available',
      },
      agricultureInstructions: {
        label: 'Agriculture Or Quarantine Instructions',
        rules: 'max:200',
      },
      immigrationAvailable: {
        label: 'Immigration Available At Airport',
      },
      immigrationInstructions: {
        label: 'Immigration Instructions',
        rules: 'max:200',
      },
    },
  },
  feeInformation: {
    fields: {
      customsFeesApply: {
        label: 'Customs Fees Apply',
      },
      overtimeFeesApply: {
        label: 'Overtime Fees Apply',
      },
      cashAccepted: {
        label: 'Cash Accepted',
      },
    },
  },
};
