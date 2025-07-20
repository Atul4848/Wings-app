import { ISelectOption } from "../Interfaces";
import { modelProtection } from "../Decorators";

@modelProtection
export class SelectOption implements ISelectOption {
  id: number;
  name: string = '';
  value: string | number | boolean = '';

  constructor(data?: Partial<SelectOption>) {
    Object.assign(this, data);
  }

  public get label(): string {
    return this.name;
  }
}
