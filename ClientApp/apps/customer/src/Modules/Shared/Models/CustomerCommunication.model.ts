import { CoreModel, EntityMapModel, IdNameCodeModel, ISelectOption, SettingsTypeModel } from '@wings-shared/core';
import { IAPICommunication } from '../Interfaces/API-CustomerContact.interface';
import { CustomerCommunicationAssociatedSitesModel } from './CustomerCommunicationAssociatedSites.model';

export class CustomerCommunicationModel extends CoreModel implements ISelectOption {
  communicationLevel: SettingsTypeModel;
  contactRole: SettingsTypeModel | null;
  startDate: string;
  endDate: string;
  sequence: number;
  priority: SettingsTypeModel | null;
  communicationCategories: SettingsTypeModel[] = [];
  customer: IdNameCodeModel | null;
  offices: EntityMapModel[];
  operators: EntityMapModel[];
  registries: EntityMapModel[];
  sites: CustomerCommunicationAssociatedSitesModel[];
  operatorAssociations: EntityMapModel[] = [];
  registryAssociations: EntityMapModel[] = [];

  constructor(data?: Partial<CustomerCommunicationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICommunication): CustomerCommunicationModel {
    if (!apiData) {
      return new CustomerCommunicationModel();
    }
    const data: Partial<CustomerCommunicationModel> = {
      ...apiData,
      id: apiData.contactCommunicationId,
      communicationLevel: new SettingsTypeModel({
        ...apiData.communicationLevel,
        id: apiData.communicationLevel.communicationLevelId,
      }),
      contactRole: apiData.contactRole
        ? new SettingsTypeModel({
          ...apiData.contactRole,
          id: apiData.contactRole.contactRoleId,
        })
        : null,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      sequence: apiData.sequence,
      priority: apiData.contactPriority
        ? new SettingsTypeModel({
          ...apiData.contactPriority,
          id: apiData.contactPriority.contactPriorityId,
        })
        : null,
      communicationCategories:
        apiData.communicationCategories?.map(a => new SettingsTypeModel({ ...a, id: a.communicationCategoryId })) || [],
      customer: apiData.customer ? new IdNameCodeModel({
        id: apiData.customer.partyId,
        name: apiData.customer.name,
        code: apiData.customer.number,
      }) : null,
      offices: apiData.customerCommunicationAssociatedOffices?.map(
        entity =>
          new EntityMapModel({
            id: entity.customerCommunicationAssociatedOfficeId,
            entityId:
              entity.customerAssociatedOffice.customerAssociatedOfficeId ||
              entity.customerAssociatedOffice.associatedOfficeId,
            name: entity.customerAssociatedOffice.associatedOfficeName,
            code: entity.customerAssociatedOffice.associatedOfficeCode,
          })
      ),
      operators: apiData.customerCommunicationAssociatedOperators?.map(
        entity =>
          new EntityMapModel({
            id: entity.customerCommunicationAssociatedOperatorId,
            entityId: entity.customerAssociatedOperator.customerAssociatedOperatorId,
            name: entity.customerAssociatedOperator.operator.name,
          })
      ),
      registries: apiData.customerCommunicationAssociatedRegistries?.map(
        entity =>
          new EntityMapModel({
            id: entity.customerCommunicationAssociatedRegistryId,
            entityId: entity.customerAssociatedRegistry.customerAssociatedRegistryId,
            name: entity.customerAssociatedRegistry.registry.name,
          })
      ),
      sites: CustomerCommunicationAssociatedSitesModel.deserializeList(apiData.customerCommunicationAssociatedSites),
      operatorAssociations:
        apiData.operatorCommunicationAssociations?.map(
          entity =>
            new EntityMapModel({
              id: entity.operatorCommunicationAssociationId,
              entityId: entity.operator?.operatorId,
              name: entity.operator?.name,
            })
        ) || [],
      registryAssociations:
        apiData.registryCommunicationAssociations?.map(
          entity =>
            new EntityMapModel({
              id: entity.registryCommunicationAssociationId,
              entityId: entity.registry?.registryId,
              name: entity.registry?.name,
            })
        ) || [],
    };
    return new CustomerCommunicationModel(data);
  }

  static deserializeList(apiDataList: IAPICommunication[]): CustomerCommunicationModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerCommunicationModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
