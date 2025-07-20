import { IAPIFederationMapping } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class FederationMappingModel extends IdNameModel {
  customerNumber: string = '';
  identityProvider: string = '';
  clientId: number = 0;

  constructor(data?: Partial<FederationMappingModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(federationMapping: IAPIFederationMapping): FederationMappingModel {
    if (!federationMapping) {
      return new FederationMappingModel();
    }

    const data: Partial<FederationMappingModel> = {
      customerNumber: federationMapping.CustomerNumber,
      identityProvider: federationMapping.IdentityProvider,
      clientId: federationMapping.ClientId,
    };

    return new FederationMappingModel(data);
  }

  static deserializeList(federationMappings: IAPIFederationMapping[]): FederationMappingModel[] {
    return federationMappings ? federationMappings.map((federationMapping: IAPIFederationMapping) =>
      FederationMappingModel.deserialize(federationMapping)) : [];
  }
}
