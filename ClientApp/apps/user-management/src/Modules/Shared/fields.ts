import { ISelectOption } from '@wings-shared/core';
import { USER_LEVEL_ROLES, ROLE_LEVEL } from './Enums';

export const LevelTypeOptions: ISelectOption[] = [
  { label: ROLE_LEVEL.SERVICE, value: ROLE_LEVEL.SERVICE },
  { label: ROLE_LEVEL.CUSTOMER, value: ROLE_LEVEL.CUSTOMER },
  { label: ROLE_LEVEL.USER, value: ROLE_LEVEL.USER },
];
