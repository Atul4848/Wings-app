import { CoreModel, EntityMapModel, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPICommunicationFlatView } from '../../Interfaces';
import { CustomerCommunicationAssociatedSitesModel } from '../CustomerCommunicationAssociatedSites.model';

export class ContactCommunicationFlatViewModel extends CoreModel {
  contact: string;
  contactExtension: string;
  contactName: string;
  contactMethod: SettingsTypeModel;
  contactType: SettingsTypeModel;

  // Communication
  startDate: string;
  endDate: string;
  sequence: number;
  contactRole: SettingsTypeModel | null;
  priority: SettingsTypeModel | null;
  communicationLevel: SettingsTypeModel;
  communicationCategories: SettingsTypeModel[] = [];
  customer: IdNameCodeModel | null;
  offices: EntityMapModel[] = [];
  operators: EntityMapModel[] = [];
  registries: EntityMapModel[] = [];
  sites: CustomerCommunicationAssociatedSitesModel[] = [];
  operatorAssociations: EntityMapModel[] = [];
  registryAssociations: EntityMapModel[] = [];

  constructor(data?: Partial<ContactCommunicationFlatViewModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICommunicationFlatView): ContactCommunicationFlatViewModel {
    const data: Partial<ContactCommunicationFlatViewModel> = {
      ...apiData,
      id: apiData.contactId || apiData.id,
      contact: apiData.contactValue,
      contactMethod: new SettingsTypeModel({ ...apiData.contactMethod, id: apiData.contactMethod?.contactMethodId }),
      contactType: new SettingsTypeModel({ ...apiData.contactType, id: apiData.contactType?.contactTypeId }),

      // communication fields
      sequence: apiData.sequence,
      priority: new SettingsTypeModel({ ...apiData.contactPriority, id: apiData.contactPriority?.contactPriorityId }),
      contactRole: new SettingsTypeModel({ ...apiData.contactRole, id: apiData.contactRole?.contactRoleId }),
      communicationLevel: new SettingsTypeModel({
        ...apiData.communicationLevel,
        id: apiData.communicationLevel?.communicationLevelId,
      }),
      communicationCategories:
        apiData.communicationCategories?.map(a => new SettingsTypeModel({ ...a, id: a.communicationCategoryId })) || [],
      ...this.deserializeAuditFields(apiData),
      customer: apiData.customer
        ? new IdNameCodeModel({
          id: apiData.customer.partyId,
          name: apiData.customer.name,
          code: apiData.customer.number,
        })
        : null,
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
    return new ContactCommunicationFlatViewModel(data);
  }

  static deserializeList(apiDataList: IAPICommunicationFlatView[]): ContactCommunicationFlatViewModel[] {
    return apiDataList ? apiDataList.map(apiData => ContactCommunicationFlatViewModel.deserialize(apiData)) : [];
  }
}
