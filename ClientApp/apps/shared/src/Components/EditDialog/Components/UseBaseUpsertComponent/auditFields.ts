import { EDITOR_TYPES } from '@wings-shared/form-controls';
import { DATE_FORMAT } from '@wings-shared/core';

export const auditFields = [
  {
    fieldKey: 'createdBy',
    type: EDITOR_TYPES.TEXT_FIELD,
  },
  {
    fieldKey: 'createdOn',
    type: EDITOR_TYPES.DATE_TIME,
    dateTimeFormat: DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN,
  },
  {
    fieldKey: 'modifiedBy',
    type: EDITOR_TYPES.TEXT_FIELD,
  },
  {
    fieldKey: 'modifiedOn',
    type: EDITOR_TYPES.DATE_TIME,
    dateTimeFormat: DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN,
  },
];
