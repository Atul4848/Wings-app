import { modelProtection } from '@wings-shared/core';
import { IAPICSDProductsServicesResponse } from '../Interfaces';
@modelProtection
export class UserCSDDetails {
  product: string;
  services: string[] = [];

  constructor(data?: Partial<UserCSDDetails>) {
    Object.assign(this, data);
  }

  static deserialize(role: IAPICSDProductsServicesResponse): UserCSDDetails {
    if (!role) {
      return new UserCSDDetails();
    }
    const data: Partial<UserCSDDetails> = {
      product: role.Product,
      services: role.Services,
    };

    return new UserCSDDetails(data);
  }

  public serialize(): IAPICSDProductsServicesResponse {
    return {
      Product: this.product,
      Services: this.services,
    };
  }

  static deserializeList(roles: IAPICSDProductsServicesResponse[]): UserCSDDetails[] {
    return roles
      ? roles.map((role: IAPICSDProductsServicesResponse) => UserCSDDetails.deserialize(role))
      : [];
  }
}