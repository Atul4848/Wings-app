import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { DeliveryTypeModel } from './index';
import { IAPIProvider } from '../Interfaces';

@modelProtection
export class ProviderModel extends IdNameModel implements ISelectOption {
    type: DeliveryTypeModel;

    constructor(data?: Partial<ProviderModel>) {
      super();
      Object.assign(this, data);
      this.type = new DeliveryTypeModel(data?.type);
    }

    static deserialize(provider: IAPIProvider): ProviderModel{
      if (!provider) {
        return new ProviderModel();
      }
      
      const data: Partial<ProviderModel> = {
        id: provider.ProviderId,
        name: provider.Name,
        type: DeliveryTypeModel.deserialize(provider.DeliveryType),
      };
      return new ProviderModel(data);
    }

    static deserializeList(providers: IAPIProvider[]): ProviderModel[] {
      return providers ? providers.map((provider: IAPIProvider) => ProviderModel.deserialize(provider)) : [];
    }

    // required in auto complete
    public get label(): string {
      return this.name;
    }

    public get value(): string | number {
      return this.id;
    }
}