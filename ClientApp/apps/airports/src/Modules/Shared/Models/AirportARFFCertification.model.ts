import { modelProtection, Utilities, DATE_FORMAT, CoreModel, ISelectOption } from '@wings-shared/core';
import { IAPIAirportARFFCertification, IAPIAirportARFFCertificationRequest } from '../Interfaces';
import { AirportCodeSettingsModel } from './AirportCodeSettings.model';

@modelProtection
export class AirportARFFCertificationModel extends CoreModel implements ISelectOption {
  id: number = 0;
  classCode: AirportCodeSettingsModel;
  certificateCode: AirportCodeSettingsModel;
  serviceCode: AirportCodeSettingsModel;
  certificationDate: string = '';
  isHigherCategoryAvailableOnRequest: boolean = null;

  constructor(data?: Partial<AirportARFFCertificationModel>) {
    super();
    Object.assign(this, data);
    this.classCode = data?.classCode ? new AirportCodeSettingsModel(data?.classCode) : null;
    this.certificateCode = data?.certificateCode ? new AirportCodeSettingsModel(data?.certificateCode) : null;
    this.serviceCode = data?.serviceCode ? new AirportCodeSettingsModel(data?.serviceCode) : null;
  }

  static deserialize(apiData: IAPIAirportARFFCertification): AirportARFFCertificationModel {
    if (!apiData) {
      return new AirportARFFCertificationModel();
    }

    const data: Partial<AirportARFFCertificationModel> = {
      id: apiData.airportARFFCertificationId,
      isHigherCategoryAvailableOnRequest: apiData.isHigherCategoryAvailableOnRequest,
      certificationDate: Utilities.parseDateTime(
        `${apiData.certificationMonth}-${apiData.certificationYear}`,
        DATE_FORMAT.ARFF_CERTIFICATION_DATE
      )?.format(DATE_FORMAT.API_FORMAT),
      classCode: apiData.classCode
        ? new AirportCodeSettingsModel({
          ...apiData.classCode,
          id: apiData.classCode?.classCodeId,
        })
        : null,
      certificateCode: apiData.certificateCode
        ? new AirportCodeSettingsModel({
          ...apiData.certificateCode,
          id: apiData.certificateCode?.certificateCodeId,
        })
        : null,
      serviceCode: apiData.serviceCode
        ? new AirportCodeSettingsModel({
          ...apiData.serviceCode,
          id: apiData.serviceCode?.serviceCodeId,
        })
        : null,
    };
    return new AirportARFFCertificationModel(data);
  }

  static deserializeList(apiDataList: IAPIAirportARFFCertification[]): AirportARFFCertificationModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirportARFFCertification) => AirportARFFCertificationModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIAirportARFFCertificationRequest {
    const certificateCode = Utilities.parseDateTime(this.certificationDate);
    return {
      id: this.id,
      classCodeId: this.classCode?.id,
      certificateCodeId: this.certificateCode?.id,
      serviceCodeId: this.serviceCode?.id,
      certificationMonth: Utilities.getNumberOrNullValue(certificateCode?.format('MM')),
      certificationYear: Utilities.getNumberOrNullValue(certificateCode?.format('YYYY')),
      isHigherCategoryAvailableOnRequest: this.isHigherCategoryAvailableOnRequest,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
