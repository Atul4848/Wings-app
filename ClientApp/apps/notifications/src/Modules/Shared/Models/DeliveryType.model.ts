import { ISelectOption, IdNameModel } from '@wings-shared/core';
import { DELIVERY_TYPE } from '../Enums';

export class DeliveryTypeModel extends IdNameModel<DELIVERY_TYPE> implements ISelectOption {
  constructor(data?: Partial<DeliveryTypeModel>) {
    super();
    Object.assign(this, data);
    this.id = data?.id || DELIVERY_TYPE.EMAIL;
    this.name = data?.name || DELIVERY_TYPE.EMAIL;
  }

  static deserialize(deliveryType: DELIVERY_TYPE): DeliveryTypeModel {
    if (!deliveryType) {
      return new DeliveryTypeModel();
    }
    const data: Partial<DeliveryTypeModel> = {
      id: deliveryType,
      name: deliveryType,
    };
    return new DeliveryTypeModel(data);
  }

  static searilize(data: DeliveryTypeModel): DELIVERY_TYPE {
    if(!data)
      return DELIVERY_TYPE.EMAIL;

    return data.name as DELIVERY_TYPE;
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.id;
  }
}
