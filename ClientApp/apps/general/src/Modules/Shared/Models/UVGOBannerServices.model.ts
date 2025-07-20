import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIUVGOBannerServicesResponse } from '../Interfaces';

@modelProtection
export class UVGOBannerServicesModel extends IdNameModel implements ISelectOption {
  description: string = '';

  constructor(data?: Partial<UVGOBannerServicesModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(uvgoBannerServices: IAPIUVGOBannerServicesResponse): UVGOBannerServicesModel {
    if (!uvgoBannerServices) {
      return new UVGOBannerServicesModel();
    }

    const data: Partial<UVGOBannerServicesModel> = {
      id: uvgoBannerServices.NotificationServiceId,
      name: uvgoBannerServices.Name,
      description: uvgoBannerServices.Description,
    };
    return new UVGOBannerServicesModel(data);
  }

  static deserializeList(uvgoBannerServices: IAPIUVGOBannerServicesResponse[]): UVGOBannerServicesModel[] {
    return uvgoBannerServices
      ? uvgoBannerServices.map((uvgoBannersServices: IAPIUVGOBannerServicesResponse) =>
        UVGOBannerServicesModel.deserialize(uvgoBannersServices)
      )
      : [];
  }

  // serialize object for create/update API
  public serialize(): IAPIUVGOBannerServicesResponse {
    return {
      NotificationServiceId: this.id,
      Name: this.name,
      Description: this.description,
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.name;
  }
}
