import { ISelectOption, modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';
import { IAPIRequestLocationA2GAgent } from '../Interfaces/Request/API-Request-VendorLocationA2G.interface';

@modelProtection
export class LocationA2GAgentModel extends BaseModel implements ISelectOption {
  public id: number;
  public vendorLocationA2GId: number;
  public name: string = '';
  public phone: string = '';
  public phoneExt: string = '';
  public email: string = '';
  public profilePdfUri: string = '';

  constructor(data?: Partial<LocationA2GAgentModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: LocationA2GAgentModel): LocationA2GAgentModel {
    if (!apiData) {
      return new LocationA2GAgentModel();
    }
    const data: Partial<LocationA2GAgentModel> = {
      ...apiData,
      vendorLocationA2GId: apiData.vendorLocationA2GId,
      name: apiData.name,
      phone: apiData.phone || null,
      phoneExt: apiData.phoneExt || null,
      email: apiData.email|| null,
      profilePdfUri: apiData.profilePdfUri || null
    };
    return new LocationA2GAgentModel(data);
  }

  public serialize(profilePdfUri: string): IAPIRequestLocationA2GAgent {
    return {
      userId: '',
      id: this.id || 0,
      name: this.name,
      phone: this.phone,
      profilePdfUri: profilePdfUri ? profilePdfUri : this.profilePdfUri || null,
      phoneExt: this.phoneExt,
      email: this.email,
    };
  }

  static deserializeList(apiDataList: LocationA2GAgentModel[]): LocationA2GAgentModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => LocationA2GAgentModel.deserialize(apiData)) : [];
  }
}
