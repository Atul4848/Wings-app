import { modelProtection, IdNameCodeModel } from '@wings-shared/core';
import { IAPIAircraftRegistrySequenceBase } from '../../Interfaces';

@modelProtection
export class RegistrySequenceBaseModel extends IdNameCodeModel {
  sequenceNumber: number = null;

  constructor(data?: Partial<RegistrySequenceBaseModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAircraftRegistrySequenceBase): RegistrySequenceBaseModel {
    if (!apiData) {
      return new RegistrySequenceBaseModel();
    }
    const data: Partial<RegistrySequenceBaseModel> = {
      ...apiData,
    };
    return new RegistrySequenceBaseModel(data);
  }

  static deserializeList(apiData: IAPIAircraftRegistrySequenceBase[]): RegistrySequenceBaseModel[] {
    return apiData.map(a => RegistrySequenceBaseModel.deserialize(a));
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
