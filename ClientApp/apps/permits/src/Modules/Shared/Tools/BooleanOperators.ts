import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

const booleanOptions: ISelectOption[] = [
  { label: 'True', value: 1 },
  { label: 'False', value: 2 },
];

export const BooleanOperators = booleanOptions.map((option: ISelectOption) =>
  SettingsTypeModel.deserialize({ id: Number(option.value), name: option.label })
);
