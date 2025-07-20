import { modelProtection } from '@wings-shared/core';
import { IAttributesResponse } from '../Interfaces';

@modelProtection
export class AttributesModel {
  type: string = '';
  value: string = '';

  constructor(data?: Partial<AttributesModel>) {
    Object.assign(this, data);
  }

  static deserialize(attribute: IAttributesResponse): AttributesModel {
    if (!attribute) {
      return new AttributesModel();
    }

    const data: Partial<AttributesModel> = {
      type: attribute.Type,
      value: attribute.Value,
    };

    return new AttributesModel(data);
  }

  public serialize(): IAttributesResponse { 
    return {
      Type: this.type,
      Value: this.value,
    };
  }

  static deserializeList(profiles: IAttributesResponse[]): AttributesModel[] {
    return profiles
      ? profiles.map((attribute: IAttributesResponse) => AttributesModel.deserialize(attribute))
      : [];
  }
}
