import { EntityMapModel, IdNameCodeModel, modelProtection } from '@wings-shared/core';
import { IAssociatedOfficeRequest, IAPIAssociatedOffice } from '../Interfaces';
import { CustomerRefModel } from '@wings/shared';

@modelProtection
export class AssociatedOfficeModel extends IdNameCodeModel {
  startDate: string = '';
  endDate: string = '';
  airport: IdNameCodeModel;
  customer: CustomerRefModel;
  customerAssociatedRegistries: EntityMapModel[] = [];
  
  constructor(data?: Partial<AssociatedOfficeModel>) {
    super(data);
    Object.assign(this, data);
  }

  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }

  static deserialize(apiData: IAPIAssociatedOffice): AssociatedOfficeModel {
    if (!apiData) {
      return new AssociatedOfficeModel();
    }
    const data: Partial<AssociatedOfficeModel> = {
      ...apiData,
      id: apiData.associatedOfficeId || apiData.officeId || apiData.id,
      code: apiData.associatedOfficeCode || apiData.code,
      name: apiData.associatedOfficeName || apiData.name,
      customer: CustomerRefModel.deserialize(apiData.customer),
      airport: IdNameCodeModel.deserialize({
        id: apiData.airport?.airportId,
        name: apiData.airport?.airportName,
        code: apiData.airport?.airportCode || '',
      }),
      customerAssociatedRegistries: apiData.customerAssociatedRegistries?.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.customerAssociatedRegistryId,
            entityId: entity.registry.registryId,
            name: entity.registry.name,
          })
      ),
      ...this.deserializeAuditFields(apiData),
    };
    return new AssociatedOfficeModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedOffice[]): AssociatedOfficeModel[] {
    return apiDataList ? apiDataList.map(apiData => AssociatedOfficeModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(partyId: number): IAssociatedOfficeRequest {
    return {
      partyId,
      id: this.id,
      name: this.name,
      code: this.code,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      customerStartDate: this.customer?.startDate,
      customerEndDate: this.customer?.endDate,
      airportId: this.airport?.id || null,
      airportName: this.airport?.name || '',
      airportCode: this.airport?.code || '',
      customerName: this.customer?.name,
      customerNumber: this.customer?.number,
      customerAssociatedRegistryIds: this.customerAssociatedRegistries?.map(x => x.id || 0),
      ...this._serialize(),
    };
  }
}
