import { ISelectOption, IdNameModel } from '@wings-shared/core';
import { FIELD_TYPE } from '../Enums';

export class FieldTypeModel extends IdNameModel<FIELD_TYPE> implements ISelectOption {
  constructor(data?: Partial<FieldTypeModel>) {
    super();
    Object.assign(this, data);
    this.id = data?.id || FIELD_TYPE.STRING;
    this.name = data?.name || FIELD_TYPE.STRING;
  }

  static deserialize(fieldType: FIELD_TYPE): FieldTypeModel {
    if (!fieldType) {
      return new FieldTypeModel();
    }
    const data: Partial<FieldTypeModel> = {
      id: fieldType,
      name: fieldType,
    };
    return new FieldTypeModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.id;
  }
}
