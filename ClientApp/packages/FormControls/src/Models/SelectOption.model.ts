import { ISelectOption, modelProtection } from '@wings-shared/core';
@modelProtection
export class SelectOption implements ISelectOption {
  id: number;
  name: string = '';
  value: string | number = '';

  constructor(data?: Partial<SelectOption>) {
    Object.assign(this, data);
  }

  public get label(): string {
    return this.name;
  }
}
