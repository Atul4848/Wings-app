import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportCustom } from '../Interfaces';
import { AirportCustomGeneralModel } from './AirportCustomGeneral.model';
import { IntlCustomsDetailsModel } from './IntlCustomsDetails.model';
import { UsCustomsDetailsModel } from './UsCustomsDetails.model';
import { CustomsDetailInfoModel } from './CustomsDetailInfo.model';

@modelProtection
export class AirportCustomModel extends CoreModel {
  generalInformation = new AirportCustomGeneralModel();
  internationalCustomsInformation = new IntlCustomsDetailsModel();
  usCustomsInformation = new UsCustomsDetailsModel();
  customsDetailId: number;

  constructor(data?: Partial<AirportCustomModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportCustom): AirportCustomModel {
    if (!apiData) {
      return new AirportCustomModel();
    }
    const data: Partial<AirportCustomModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      generalInformation: AirportCustomGeneralModel.deserialize(apiData.generalInformation),
      internationalCustomsInformation: IntlCustomsDetailsModel.deserialize(apiData.internationalCustomsInformation),
      usCustomsInformation: UsCustomsDetailsModel.deserialize(apiData.usCustomsInformation),
      customsDetailId: apiData.customsDetail?.customsDetailId || apiData.customsDetail?.id,
    };
    return new AirportCustomModel(data);
  }

  static deserializeList(apiDataList: IAPIAirportCustom[]): AirportCustomModel[] {
    return apiDataList ? apiDataList.map(apiData => AirportCustomModel.deserialize(apiData)) : [];
  }
}
