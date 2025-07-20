import { ISelectOption, SettingsTypeModel } from '@wings-shared/core';

const logicalOptions: ISelectOption[] = [
  { label: 'And', value: 1 },
  { label: 'Or', value: 2 },
];

export const LogicalOperators = logicalOptions.map((option: ISelectOption) =>
  SettingsTypeModel.deserialize({ id: Number(option.value), name: option.label })
);
