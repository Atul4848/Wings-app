import { MODEL_STATUS, StatusTypeModel } from '@wings-shared/core';

export const ModelStatusOptions: StatusTypeModel[] = [
  new StatusTypeModel({ name: 'Active', id: MODEL_STATUS.ACTIVE }),
  new StatusTypeModel({ name: 'InActive', id: MODEL_STATUS.IN_ACTIVE }),
];
