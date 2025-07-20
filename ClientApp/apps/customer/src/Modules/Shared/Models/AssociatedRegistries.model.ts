import { CoreModel, EntityMapModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIAssociatedRegistries, IAssociatedRegistryRequest } from '../Interfaces';
import { RegistryModel } from './Registry.model';
import { TeamModel } from './Team.model';
import { AssociatedOfficeModel } from './AssociatedOffice.model';
import { CustomerRefModel } from '@wings/shared';

@modelProtection
export class AssociatedRegistriesModel extends CoreModel {
  startDate: string = '';
  endDate: string = '';
  registry: RegistryModel;
  customer: CustomerRefModel;
  team: TeamModel;
  associatedOffice: AssociatedOfficeModel;
  associatedRegistryServiceTypes: EntityMapModel[] = [];
  associatedRegistrySites: EntityMapModel[] = [];

  constructor(data?: Partial<AssociatedRegistriesModel>) {
    super(data);
    Object.assign(this, data);
  }

  public get label(): string {
    return this.registry.name;
  }

  public get value(): number {
    return this.id;
  }
  static deserialize(apiData: IAPIAssociatedRegistries): AssociatedRegistriesModel {
    if (!apiData) {
      return new AssociatedRegistriesModel();
    }
    const data: Partial<AssociatedRegistriesModel> = {
      ...apiData,
      id: apiData.associatedRegistryId || apiData.id,
      registry: RegistryModel.deserialize(apiData.registry),
      customer: CustomerRefModel.deserialize(apiData.customer),
      team: TeamModel.deserialize(apiData?.team),
      associatedOffice: AssociatedOfficeModel.deserialize(apiData.associatedOffice),
      associatedRegistryServiceTypes:
        apiData.associatedRegistryServiceTypes?.map(
          entity =>
            new EntityMapModel({
              ...entity,
              id: entity.associatedRegistryServiceTypeId,
              entityId: entity.serviceType.serviceTypeId || entity.serviceType.id,
              name: entity.serviceType.name,
            })
        ) || [],
      associatedRegistrySites:
        apiData.associatedRegistrySites?.map(
          entity =>
            new EntityMapModel({
              ...entity,
              id: entity.associatedRegistrySiteId,
              entityId: entity.site.associatedSiteId as number,
              name: entity.site.associatedSiteName,
            })
        ) || [],
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AssociatedRegistriesModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedRegistries[]): AssociatedRegistriesModel[] {
    return apiDataList ? apiDataList.map(apiData => AssociatedRegistriesModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(partyId: number): IAssociatedRegistryRequest {
    return {
      partyId,
      id: this.id || 0,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      registryId: this.registry?.id,
      customerName: this.customer?.name,
      customerNumber: this.customer?.number,
      customerStartDate: this.customer?.startDate,
      customerEndDate: this.customer?.endDate,
      teamId: this.team?.id || null,
      associatedOfficeId: this.associatedOffice?.id || null,
      associatedRegistryServiceTypes: Boolean(this.associatedRegistryServiceTypes.length)
        ? this.associatedRegistryServiceTypes?.map(x => ({
          id: x.id || 0,
          serviceTypeId: x.entityId,
        }))
        : [],
      ...this._serialize(),
    };
  }
}
