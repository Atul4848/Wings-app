import { CoreModel, ISelectOption, SettingsTypeModel } from '@wings-shared/core';
import { ICustomerCommRequest } from '../Interfaces';
import { IAPIContactCommunication } from '../Interfaces/API-CustomerContact.interface';
import { CustomerCommunicationModel } from './CustomerCommunication.model';

export class CustomerContactModel extends CoreModel implements ISelectOption {
  contact: string;
  contactExtension: string;
  contactName: string;
  contactMethod: SettingsTypeModel;
  contactType: SettingsTypeModel;
  communications: CustomerCommunicationModel[];

  constructor(data?: Partial<CustomerContactModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIContactCommunication): CustomerContactModel {
    if (!apiData) {
      return new CustomerContactModel();
    }
    const data: Partial<CustomerContactModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.contactId || apiData.id,
      contact: apiData.contactValue,
      contactMethod: new SettingsTypeModel({ ...apiData.contactMethod, id: apiData.contactMethod?.contactMethodId }),
      contactType: new SettingsTypeModel({ ...apiData.contactType, id: apiData.contactType?.contactTypeId }),
      communications: CustomerCommunicationModel.deserializeList(apiData.communications),
    };
    return new CustomerContactModel(data);
  }

  static deserializeList(apiDataList: IAPIContactCommunication[]): CustomerContactModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerContactModel.deserialize(apiData)) : [];
  }

  findCommunication(communicationId: number): CustomerCommunicationModel {
    return this.communications?.find(x => Number(x.id) === communicationId) || new CustomerCommunicationModel();
  }

  public serialize(communicationId: number): ICustomerCommRequest {
    const communication = this.findCommunication(communicationId);
    return {
      id: Number(this.id) || 0,
      contactValue: this.contact,
      contactExtension: this.contactExtension,
      contactName: this.contactName,
      contactMethodId: this.contactMethod.id,
      contactTypeId: this.contactType.id,
      startDate: communication.startDate,
      contactRoleId: communication.contactRole?.id || null,
      endDate: communication.endDate || null,
      communicationLevelId: communication.communicationLevel?.id,
      priorityId: communication?.priority?.id || null,
      sequence: communication?.sequence || null,
      contactCommunicationId: Number(communication.id),
      customerNumber: communication.customer?.code || '',
      customerName: communication.customer?.name || '',
      partyId: communication.customer?.id || 0,
      operatorCommunicationAssociations: communication.operatorAssociations?.map(x => x.entityId) || [],
      registryCommunicationAssociations: communication.registryAssociations?.map(x => x.entityId) || [],
      contactCommunicationCategories: communication.communicationCategories
        ? communication?.communicationCategories?.map(x => x.id)
        : [],
      customerOperatorCommunicationAssociations: communication.operators?.map(x => x.entityId) || [],
      customerRegistryCommunicationAssociations: communication.registries?.map(x => x.entityId) || [],
      customerOfficeCommunicationAssociations: communication.offices?.map(x => x.entityId) || [],
      customerSiteCommunicationAssociations: communication.sites?.map(x => x.serialize()),
      ...this._serialize(),
    };
  }

  // required in auto complete
  public get label(): string {
    return this.contact;
  }

  public get value(): string | number {
    return this.id;
  }
}
