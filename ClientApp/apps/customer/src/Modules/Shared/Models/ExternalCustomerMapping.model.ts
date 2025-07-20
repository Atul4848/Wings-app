import { CoreModel, EntityMapModel, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIExternalCustomerMapping } from '../Interfaces';
import { CustomerRefModel } from '@wings/shared';

export class ExternalCustomerMappingModel extends CoreModel {
  externalApiKey: string = '';
  externalAccountId: string = '';
  externalCustomerMappingLevel: SettingsTypeModel;
  externalCustomerSource: SettingsTypeModel;
  customer: CustomerRefModel;
  customerAssociatedOffices: IdNameCodeModel[] = [];
  customerAssociatedRegistries: EntityMapModel[] = [];
  customerAssociatedOperators: EntityMapModel[] = [];

  constructor(data?: Partial<ExternalCustomerMappingModel>) {
    super(data);
    Object.assign(this, data);
    this.externalCustomerMappingLevel = data?.externalCustomerMappingLevel
      ? new SettingsTypeModel(data?.externalCustomerMappingLevel)
      : null;
    this.externalCustomerSource = data?.externalCustomerSource
      ? new SettingsTypeModel(data?.externalCustomerSource)
      : null;
    this.customerAssociatedOffices = data?.customerAssociatedOffices?.map(x => new IdNameCodeModel(x)) || [];
    this.customerAssociatedRegistries = data?.customerAssociatedRegistries?.map(x => new EntityMapModel(x)) || [];
    this.customerAssociatedOperators = data?.customerAssociatedOperators?.map(x => new EntityMapModel(x)) || [];
  }

  static deserialize(apiData: IAPIExternalCustomerMapping): ExternalCustomerMappingModel {
    if (!apiData) {
      return new ExternalCustomerMappingModel();
    }
    const data: Partial<ExternalCustomerMappingModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.externalCustomerMappingId || apiData.id,
      externalCustomerMappingLevel: apiData.externalCustomerMappingLevel
        ? new SettingsTypeModel({
          ...apiData.externalCustomerMappingLevel,
          id:
              apiData.externalCustomerMappingLevel?.externalCustomerMappingLevelId ||
              apiData.externalCustomerMappingLevel?.id,
        })
        : null,
      externalCustomerSource: apiData.externalCustomerSource
        ? new SettingsTypeModel({
          ...apiData.externalCustomerSource,
          id: apiData.externalCustomerSource?.externalCustomerSourceId || apiData.externalCustomerSource?.id,
        })
        : null,
      customer: apiData.customer
        ? new CustomerRefModel({
          partyId: apiData.customer?.partyId,
          name: apiData.customer?.name,
          number: apiData.customer?.number,
        })
        : null,
      customerAssociatedOffices: apiData.customerAssociatedOffices?.map(
        x =>
          new IdNameCodeModel({
            id: x.customerAssociatedOfficeId || x.associatedOfficeId,
            name: x.associatedOfficeName,
            code: x.associatedOfficeCode,
          })
      ),
      customerAssociatedRegistries: apiData.customerAssociatedRegistries?.map(
        x =>
          new EntityMapModel({
            id: x.customerAssociatedRegistryId,
            entityId: x.registry?.registryId || x.registry?.id,
            name: x.registry?.name,
          })
      ),
      customerAssociatedOperators: apiData.customerAssociatedOperators?.map(
        x =>
          new EntityMapModel({
            id: x.customerAssociatedOperatorId,
            entityId: x.operator.operatorId || x.operator?.id,
            name: x.operator?.name,
          })
      ),
    };
    return new ExternalCustomerMappingModel(data);
  }

  static deserializeList(apiDataList: IAPIExternalCustomerMapping[]): ExternalCustomerMappingModel[] {
    return apiDataList ? apiDataList.map(apiData => ExternalCustomerMappingModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): IAPIExternalCustomerMapping {
    return {
      id: this.id || 0,
      externalApiKey: this.externalApiKey,
      externalAccountId: this.externalAccountId || null,
      externalCustomerMappingLevelId: this.externalCustomerMappingLevel?.id,
      externalCustomerSourceId: this.externalCustomerSource?.id,
      partyId: this.customer?.partyId,
      customerName: this.customer?.name,
      customerNumber: this.customer?.number,
      customerStartDate: this.customer?.startDate,
      customerEndDate: this.customer?.endDate,
      // for these three we need to send id insted of entity id becasue these are the associated entites
      // .filter(Boolean) used to clear 0 ids
      customerAssociatedRegistryIds: this.customerAssociatedRegistries.map(x => x.id).filter(Boolean),
      customerAssociatedOfficeIds: this.customerAssociatedOffices.map(x => x.id).filter(Boolean),
      customerAssociatedOperatorIds: this.customerAssociatedOperators.map(x => x.id).filter(Boolean),
      ...this._serialize(),
    };
  }
}
