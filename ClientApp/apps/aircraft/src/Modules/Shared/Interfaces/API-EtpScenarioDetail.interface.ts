import {
  IAPICruiseEtpProfile,
  IAPIEtpApuBurn,
  IAPIEtpFinalDescentBurn,
  IAPIEtpHold,
  IAPIEtpInitialDescent,
  IAPIEtpMissedApproach,
  IAPIEtpPenalty,
  IAPIEtpScenario,
} from './index';

export interface IAPIEtpScenarioDetail extends IAPIEtpScenario {
  etpInitialDescent: IAPIEtpInitialDescent;
  etpHold: IAPIEtpHold;
  etpMissedApproach: IAPIEtpMissedApproach;
  etpapuBurn: IAPIEtpApuBurn;
  etpFinalDescentBurn: IAPIEtpFinalDescentBurn;
  etpPenalties?: IAPIEtpPenalty[];
  etpCruiseProfile: IAPICruiseEtpProfile;
}
