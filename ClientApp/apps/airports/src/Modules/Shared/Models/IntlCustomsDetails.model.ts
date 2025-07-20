import { CoreModel, getYesNoNullToBoolean, modelProtection } from '@wings-shared/core';
import { IAPIIntlCustomsDetails } from '../Interfaces';
import { QuarantineOrImmigrationInfoModel } from './QuarantineOrImmigrationInfo.model';
import { FeeInformationModel } from './FeeInformation.model';
@modelProtection
export class IntlCustomsDetailsModel extends CoreModel {
  airportId: number;
  overtimeAllowed: boolean;
  taxRefundAvailable: boolean;
  vipProcessingAvailable: boolean;
  cargoClearanceAvailable: boolean;
  overtimeRequirements: string;
  taxRefundInstructions: string;
  quarantineInfo: QuarantineOrImmigrationInfoModel;
  feeInformation: FeeInformationModel;

  constructor(data?: Partial<IntlCustomsDetailsModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIIntlCustomsDetails): IntlCustomsDetailsModel {
    if (!apiData) {
      return new IntlCustomsDetailsModel();
    }
    const data: Partial<IntlCustomsDetailsModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.internationalCustomsInformationId || apiData.id,
      quarantineInfo: QuarantineOrImmigrationInfoModel.deserialize(apiData.quarantineOrImmigrationInformation),
      feeInformation: FeeInformationModel.deserialize(apiData.feeInformation),
    };
    return new IntlCustomsDetailsModel(data);
  }

  //serialize object for create/update API
  public serialize(): IAPIIntlCustomsDetails {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      vipProcessingAvailable: getYesNoNullToBoolean(this.vipProcessingAvailable),
      overtimeAllowed: getYesNoNullToBoolean(this.overtimeAllowed),
      overtimeRequirements: this.overtimeRequirements,
      taxRefundAvailable: getYesNoNullToBoolean(this.taxRefundAvailable),
      taxRefundInstructions: this.taxRefundInstructions,
      cargoClearanceAvailable: getYesNoNullToBoolean(this.cargoClearanceAvailable),
      quarantineOrImmigrationInformation: this.quarantineInfo?.serialize() || null,
      feeInformation: this.feeInformation?.serialize() || null,
    };
  }

  static deserializeList(apiDataList: IAPIIntlCustomsDetails[]): IntlCustomsDetailsModel[] {
    return apiDataList ? apiDataList.map(apiData => IntlCustomsDetailsModel.deserialize(apiData)) : [];
  }
}
