import { IAPIUVGOBannerResponse } from '../Interfaces';
import { modelProtection, regex } from '@wings-shared/core';
import { UVGOBannerTypeModel } from './UVGOBannerType.model';
import { UVGOBannerServicesModel } from './UVGOBannerServices.model';

@modelProtection
export class UVGOBannerModel {
  id: string = '';
  effectiveEndDate: string = '';
  effectiveStartDate: string = '';
  isEdit: boolean = false;
  message: string = '';
  applicationName: string = '';
  requestedDate: string = '';
  bannerType: UVGOBannerTypeModel | null = null;
  bannerService: UVGOBannerServicesModel | null = null;
  requesterUserName: string = '';
  totalRows: number = 0;
  embeddedLink: string = '';

  constructor(data?: Partial<UVGOBannerModel>) {
    Object.assign(this, data);
  }

  static getEmbeddedLink(message: string): string {
    const matches = message.match(regex.url);
    if (!matches) {
      return '';
    }
    return matches[0];
  }

  static formatMessage(message: string): string {
    const matches = message.match(regex.url);
    if (!matches) {
      return message;
    }
    return message.replace(matches[0], '');
  }

  static deserialize(uvgoBanner: IAPIUVGOBannerResponse): UVGOBannerModel {
    if (!uvgoBanner) {
      return new UVGOBannerModel();
    }

    const data: Partial<UVGOBannerModel> = {
      id: uvgoBanner.Id,
      effectiveEndDate: uvgoBanner.EffectiveEndDate,
      effectiveStartDate: uvgoBanner.EffectiveStartDate,
      isEdit: uvgoBanner.IsEdit,
      message: uvgoBanner.Message,
      applicationName: uvgoBanner.ApplicationName,
      requestedDate: uvgoBanner.RequestedDate,
      bannerType: new UVGOBannerTypeModel({
        id: uvgoBanner.NotificationTypeId,
        name: uvgoBanner.NotificationType,
      }),
      bannerService: new UVGOBannerServicesModel({
        id: uvgoBanner.NotificationServiceId,
        name: uvgoBanner.NotificationService,
      }),
      requesterUserName: uvgoBanner.RequesterUserName,
      totalRows: uvgoBanner.TotalRows,
      embeddedLink: this.getEmbeddedLink(uvgoBanner.Message),
    };
    return new UVGOBannerModel(data);
  }

  static deserializeList(uvgoBanner: IAPIUVGOBannerResponse[]): UVGOBannerModel[] {
    return uvgoBanner
      ? uvgoBanner.map((uvgoBanners: IAPIUVGOBannerResponse) => UVGOBannerModel.deserialize(uvgoBanners))
      : [];
  }
}
