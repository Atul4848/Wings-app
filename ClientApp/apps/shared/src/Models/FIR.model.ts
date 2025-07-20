import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIFIR, IAPIFIRRequest } from '../Interfaces';

@modelProtection
export class FIRModel extends CoreModel implements ISelectOption {
  code: string = '';
  permitAppliedFIRId?: number = 0;

  constructor(data?: Partial<FIRModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiFIR: IAPIFIR): FIRModel {
    if (!apiFIR) {
      return new FIRModel();
    }
    return new FIRModel({ ...apiFIR, id: apiFIR.firId || apiFIR.id, permitAppliedFIRId: apiFIR.permitAppliedFIRId });
  }

  static deserializeList(apiFIRList: IAPIFIR[]): FIRModel[] {
    return apiFIRList ? apiFIRList.map((apiFIR: IAPIFIR) => FIRModel.deserialize(apiFIR)) : [];
  }

  public serialize(): IAPIFIRRequest {
    return {
      id: this.permitAppliedFIRId || 0,
      firId: this.id,
      code: this.code,
      name: this.name,
    };
  }

  // required in auto complete
  public get label(): string {
    if (this.name && this.code) {
      return `${this.name} (${this.code})`;
    }
    return this.code || this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
