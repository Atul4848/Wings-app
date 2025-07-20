import { AirportModel } from '@wings/shared';
import { IAPISupplier, IAPISupplierRequest } from '../Interfaces';
import { CoreModel, EntityMapModel, SettingsTypeModel } from '@wings-shared/core';
import { SupplierAirportModel } from './SupplierAirport.model';

export class SupplierModel extends CoreModel {
  emailAddress: string = '';
  supplierType: SettingsTypeModel;
  serviceLevel: SettingsTypeModel;
  countries: EntityMapModel[] = [];
  states: EntityMapModel[] = [];
  cities: EntityMapModel[] = [];
  supplierAirports: SupplierAirportModel[] = [];

  constructor(data?: Partial<SupplierModel>) {
    super(data);
    Object.assign(this, data);
    this.supplierType = data?.supplierType ? new SettingsTypeModel(data?.supplierType) : null;
    this.serviceLevel = data?.serviceLevel ? new SettingsTypeModel(data?.serviceLevel) : null;
    this.countries = data?.countries?.map(x => new EntityMapModel(x)) || [];
    this.states = data?.states?.map(x => new EntityMapModel(x)) || [];
    this.cities = data?.cities?.map(x => new EntityMapModel(x)) || [];
  }

  static deserialize(apiData: IAPISupplier): SupplierModel {
    if (!apiData) {
      return new SupplierModel();
    }

    const data: Partial<SupplierModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.supplierId || apiData.id,
      supplierAirports: SupplierAirportModel.deserializeList(apiData.supplierAirports),
      supplierType: apiData.supplierType
        ? new SettingsTypeModel({
          ...apiData.supplierType,
          id: apiData.supplierType?.supplierTypeId || apiData.supplierType?.id,
        })
        : null,
      serviceLevel: apiData.serviceLevel
        ? new SettingsTypeModel({
          ...apiData.serviceLevel,
          id: apiData.serviceLevel?.serviceLevelId || apiData.serviceLevel?.id,
        })
        : null,
      countries: apiData.supplierCountries?.map(
        x =>
          new EntityMapModel({
            ...x,
            entityId: x.countryId,
          })
      ),
      states: apiData.supplierStates?.map(
        x =>
          new EntityMapModel({
            ...x,
            entityId: x.stateId,
          })
      ),
      cities: apiData.supplierCities?.map(
        x =>
          new EntityMapModel({
            ...x,
            entityId: x.cityId,
          })
      ),
    };
    return new SupplierModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPISupplierRequest {
    return {
      id: this.id || 0,
      name: this.name,
      emailAddress: this.emailAddress,
      supplierTypeId: this.supplierType?.id || null,
      serviceLevelId: this.serviceLevel?.id || null,
      supplierCountries: this.countries?.map(x => ({
        id: x.id,
        countryId: x.entityId,
        name: x.name,
        code: x.code,
      })),
      supplierStates: this.states?.map(x => ({
        id: x.id,
        stateId: x.entityId,
        name: x.name,
        code: x.code,
      })),
      supplierCities: this.cities?.map(x => ({
        id: x.id,
        cityId: x.entityId,
        name: x.name,
        code: x.code,
      })),
      ...this._serialize(),
    };
  }

  static deserializeList(suppliers: IAPISupplier[]): SupplierModel[] {
    return suppliers ? suppliers.map((s: IAPISupplier) => SupplierModel.deserialize(s)) : [];
  }
}
