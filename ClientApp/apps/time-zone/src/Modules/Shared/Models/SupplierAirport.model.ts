import { CoreModel, EntityMapModel, modelProtection, StatusTypeModel } from '@wings-shared/core';
import { IAPISupplierAirport, IAPISupplierAirportRequest } from './../Interfaces';

@modelProtection
export class SupplierAirportModel extends CoreModel {
  id: number = 0;
  tollFreeNumber: string = '';
  phoneNumber: string = '';
  faxNumber: string = '';
  webSite: string = '';
  cappsSupplierAirportId: string ='';
  airport: EntityMapModel;
  supplierAirportId: number;
  supplierId: number;
  airportId: number;

  constructor(data?: Partial<SupplierAirportModel>) {
    super(data);
    Object.assign(this, data);
    this.status = new StatusTypeModel(data?.status);
    this.airport = new EntityMapModel(data?.airport);
  }

  static deserialize(apiData: IAPISupplierAirport): SupplierAirportModel {
    if (!apiData) {
      return new SupplierAirportModel();
    }
    const data: Partial<SupplierAirportModel> = {
      ...apiData,
      id: apiData.supplierAirportId || apiData.id || 0,
      airport:
        new EntityMapModel({
          entityId: apiData.airport.airportId,
          name: apiData.airport.name || apiData.airport.airportName,
          code: apiData.airport.airportCode || apiData.airport.displayCode,
        }) || null,
    };
    return new SupplierAirportModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPISupplierAirportRequest {
    return {
      id: this.supplierAirportId || this.id,
      tollFreeNumber: this.tollFreeNumber,
      phoneNumber: this.phoneNumber,
      faxNumber: this.faxNumber,
      webSite: this.webSite,
      airportId: this.airport?.entityId,
      statusId: this.status?.value,
      supplierId: this.supplierId,
      cappsSupplierAirportId:this.cappsSupplierAirportId,
    };
  }

  static deserializeList(apiDataList: IAPISupplierAirport[]): SupplierAirportModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPISupplierAirport) => SupplierAirportModel.deserialize(apiData))
      : [];
  }
}
