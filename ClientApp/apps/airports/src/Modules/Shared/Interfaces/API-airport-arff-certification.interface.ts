export interface IAPIAirportARFFCertification extends IAPIAirportARFFCertificationRequest {
  airportARFFCertificationId?: number;
  classCode: IAPIClassCode;
  certificateCode: IAPICertificateCode;
  serviceCode: IAPIServiceCode;
  isHigherCategoryAvailableOnRequest: boolean;
}

export interface IAPIAirportARFFCertificationRequest {
  id: number;
  classCodeId: number;
  certificateCodeId: number;
  serviceCodeId: number;
  certificationMonth: number;
  certificationYear: number;
  isHigherCategoryAvailableOnRequest: boolean;
}

interface IAPIClassCode {
  classCodeId: number;
}

interface IAPIServiceCode {
  serviceCodeId: number;
}

interface IAPICertificateCode {
  certificateCodeId: number;
}
