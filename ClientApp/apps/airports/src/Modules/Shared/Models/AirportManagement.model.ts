import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportManagement } from '../Interfaces';
import { AirportAddressModel } from './AirportAddress.model';

@modelProtection
export class AirportManagementModel extends CoreModel {
  id: number = 0;
  airportId: number;
  airportManagementId: number = 0;
  airportManagerName: string = '';
  airportOwnerName: string = '';
  airportManagerAddress: AirportAddressModel;
  airportOwnerAddress: AirportAddressModel;

  constructor(data?: Partial<AirportManagementModel>) {
    super(data);
    Object.assign(this, data);
    this.airportManagerAddress = new AirportAddressModel(data?.airportManagerAddress);
    this.airportOwnerAddress = new AirportAddressModel(data?.airportOwnerAddress);
  }

  static deserialize(apiData: IAPIAirportManagement): AirportManagementModel {
    if (!apiData) {
      return new AirportManagementModel();
    }
    const data: Partial<AirportManagementModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportManagementId || apiData.id,
      airportId: apiData.airportId,
      airportManagerName: apiData.airportManagerName,
      airportManagerAddress: AirportAddressModel.deserialize(apiData.airportManagerAddress),
      airportOwnerName: apiData.airportOwnerName,
      airportOwnerAddress: AirportAddressModel.deserialize(apiData.airportOwnerAddress),
    };
    return new AirportManagementModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportManagement {
    return {
      id: this.id,
      airportId: this.airportId,
      airportManagerName: this.airportManagerName,
      airportManagerAddress: this.airportManagerAddress.serialize(),
      airportOwnerName: this.airportOwnerName,
      airportOwnerAddress: this.airportOwnerAddress.serialize(),
    };
  }

  static deserializeList(apiData: IAPIAirportManagement[]): AirportManagementModel[] {
    return apiData ? apiData.map((data: IAPIAirportManagement) => AirportManagementModel.deserialize(data)) : [];
  }
}
