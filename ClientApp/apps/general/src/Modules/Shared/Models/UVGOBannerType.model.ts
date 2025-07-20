import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIUVGOBannerTypeResponse } from '../Interfaces';

@modelProtection
export class UVGOBannerTypeModel extends IdNameModel implements ISelectOption {
  description: string = '';

  constructor(data?: Partial<UVGOBannerTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(uvgoBannerType: IAPIUVGOBannerTypeResponse): UVGOBannerTypeModel {
    if (!uvgoBannerType) {
      return new UVGOBannerTypeModel();
    }

    const data: Partial<UVGOBannerTypeModel> = {
      id: uvgoBannerType.NotificationTypeId,
      name: uvgoBannerType.Name,
      description: uvgoBannerType.Description,
    };
    return new UVGOBannerTypeModel(data);
  }

  static deserializeList(uvgoBannerType: IAPIUVGOBannerTypeResponse[]): UVGOBannerTypeModel[] {
    return uvgoBannerType
      ? uvgoBannerType.map((uvgoBannersType: IAPIUVGOBannerTypeResponse) =>
        UVGOBannerTypeModel.deserialize(uvgoBannersType)
      )
      : [];
  }

  // serialize object for create/update API
  public serialize(): IAPIUVGOBannerTypeResponse {
    return {
      NotificationTypeId: this.id,
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
