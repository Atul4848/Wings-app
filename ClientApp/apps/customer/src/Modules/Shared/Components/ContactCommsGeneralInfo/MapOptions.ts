import { EntityMapModel } from '@wings-shared/core';
import {
  AssociatedOfficeModel,
  AssociatedOperatorsModel,
  AssociatedRegistriesModel,
  AssociatedSitesModel,
  CustomerCommunicationAssociatedSitesModel,
  CustomerSiteCommAssociationModel,
  OperatorModel,
  RegistryModel,
} from '../../Models';

/* istanbul ignore next */
export const mapEntity = (
  key: string,
  options?:
    | RegistryModel[]
    | OperatorModel[]
    | AssociatedOfficeModel[]
    | AssociatedOperatorsModel[]
    | AssociatedRegistriesModel[]
    | AssociatedSitesModel[]
) => {
  if (!Boolean(options?.length)) return [];
  switch (key) {
    case 'associatedOffices':
    case 'registries':
    case 'operators':
      return options
        ?.map(
          x =>
            new EntityMapModel({
              ...x,
              entityId: x.id,
              name: x.name,
            })
        )
        ?.filter(({ status }) => status?.name === 'Active');
    case 'associatedOperators':
      return options
        ?.map(
          x =>
            new EntityMapModel({
              ...x,
              entityId: x.id,
              name: x.operator.name,
            })
        )
        ?.filter(({ status }) => status?.name === 'Active');
    case 'associatedRegistries':
      return options
        ?.map(
          x =>
            new EntityMapModel({
              ...x,
              entityId: x.id,
              name: x.registry.name,
            })
        )
        ?.filter(({ status }) => status?.name === 'Active');
    case 'associatedSites':
      return options
        ?.map(
          site =>
            new CustomerCommunicationAssociatedSitesModel({
              ...site,
              id: 0,
              customerAssociatedSite: new CustomerSiteCommAssociationModel({
                id: site.siteUseId,
                name: site.name,
                sequence: site.sequence,
                siteUseId: site.siteUseId,
              }),
            })
        )
        ?.filter(({ status }) => status?.name === 'Active');
    default:
      return [];
  }
};
