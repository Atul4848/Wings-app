import { ISelectOption, IdNameModel } from '@wings-shared/core';

export class SystemMessageTypeModel extends IdNameModel<string> implements ISelectOption {
  constructor(data?: Partial<SystemMessageTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(value: string): SystemMessageTypeModel {
    if (!value) {
      return new SystemMessageTypeModel();
    }
    const data: Partial<SystemMessageTypeModel> = {
      id: value,
      name: value,
    };
    return new SystemMessageTypeModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.id;
  }

  static deserializeList(types: string[]): SystemMessageTypeModel[] {
    return types ? types.map((type: string) => SystemMessageTypeModel.deserialize(type)) : [];
  }
}
