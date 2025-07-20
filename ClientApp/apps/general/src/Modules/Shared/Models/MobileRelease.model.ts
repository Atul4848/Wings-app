import { IAPIMobileReleaseResponse } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class MobileReleaseModel extends IdNameModel {
  mobileReleaseId: number = 0;
  date: string = '';
  version: number = 0;
  forceUpdate: boolean = false;

  constructor(data?: Partial<MobileReleaseModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(mobileReleases: IAPIMobileReleaseResponse): MobileReleaseModel {
    if (!mobileReleases) {
      return new MobileReleaseModel();
    }

    const data: Partial<MobileReleaseModel> = {
      mobileReleaseId: mobileReleases.MobileReleaseId,
      date: mobileReleases.Date,
      version: mobileReleases.Version,
      forceUpdate: mobileReleases.ForceUpdate,
    };

    return new MobileReleaseModel(data);
  }

  static deserializeList(mobileReleases: IAPIMobileReleaseResponse[]): MobileReleaseModel[] {
    return mobileReleases
      ? mobileReleases.map((mobileRelease: IAPIMobileReleaseResponse) => MobileReleaseModel.deserialize(mobileRelease))
      : [];
  }
}
