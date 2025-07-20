import { modelProtection } from '@wings-shared/core';
import { IUserServiceNProductResponse } from '../Interfaces';

@modelProtection
export class UserServicesNProductsModel {
  service: string = '';
  product: string = '';

  constructor(data?: Partial<UserServicesNProductsModel>) {
    Object.assign(this, data);
  }

  static deserialize(user: IUserServiceNProductResponse): UserServicesNProductsModel {
    if (!user) {
      return new UserServicesNProductsModel();
    }

    const data: Partial<UserServicesNProductsModel> = {
      service: user.Service,
      product: user.Product,
    };

    return new UserServicesNProductsModel(data);
  }

  static deserializeList(profiles: IUserServiceNProductResponse[]): UserServicesNProductsModel[] {
    return profiles
      ? profiles.map((user: IUserServiceNProductResponse) => UserServicesNProductsModel.deserialize(user))
      : [];
  }
}
