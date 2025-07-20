import { IOptionValue } from '@wings-shared/core';
import { HoursTimeModel } from '@wings-shared/scheduler';

export interface ICellInstance {
  hasError: boolean;
  setValue: (value: IOptionValue | null) => void;
  setRules: (rules: string) => void;
  setCustomError: (errorMessage: string) => void;
  setTimeValue: (value: HoursTimeModel) => void;
}
