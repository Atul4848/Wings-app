import { CoreModel } from './Core.model';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class ValueUnitPairModel extends CoreModel {
  value: string = '';
  unit: string = '';

  constructor(data?: Partial<ValueUnitPairModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(value: string, unit: string): ValueUnitPairModel {
    if (!value) {
      return new ValueUnitPairModel();
    }

    const data: Partial<ValueUnitPairModel> = {
      value,
      unit,
    };

    return new ValueUnitPairModel(data);
  }
}
