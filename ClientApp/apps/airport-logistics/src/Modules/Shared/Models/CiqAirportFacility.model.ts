import { CoreModel } from './index';
import { IAPICiqAirportFacility } from './../Interfaces/index';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class CiqAirportFacilitytModel extends CoreModel {
  afSubComponentId: number = null;
  airportFacilityId: number = null;
  facilityType: string = '';

  constructor(data?: Partial<CiqAirportFacilitytModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICiqAirportFacility): CiqAirportFacilitytModel {
    if (!apiData) {
      return new CiqAirportFacilitytModel();
    }

    const data: Partial<CiqAirportFacilitytModel> = {
      afSubComponentId: apiData.AFSubComponentId,
      airportFacilityId: apiData.AirportFacilityId,
      facilityType: apiData.FacilityType,
    };

    return new CiqAirportFacilitytModel(data);
  }

  static deserializeList(apiDataList: IAPICiqAirportFacility[]): CiqAirportFacilitytModel[] {
    return Array.isArray(apiDataList)
      ? apiDataList.map(apiData => CiqAirportFacilitytModel.deserialize(apiData))
      : []
  }
}
