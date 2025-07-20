import {
  CruiseEtpProfileModel,
  EtpApuBurnModel,
  EtpFinalDescentBurnModel,
  EtpHoldModel,
  EtpInitialDescentModel,
  EtpMissedApproachModel,
  EtpPenaltyModel,
} from './index';
import { IAPIEtpPenalty, IAPIEtpScenarioDetail } from '../Interfaces';
import { EtpScenarioModel } from './EtpScenario.model';
import {
  AccessLevelModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  SettingsTypeModel,
} from '@wings-shared/core';

@modelProtection
export class EtpScenarioDetailModel extends EtpScenarioModel implements ISelectOption {
  etpInitialDescent: EtpInitialDescentModel;
  etpHold: EtpHoldModel;
  etpMissedApproach: EtpMissedApproachModel;
  etpApuBurn: EtpApuBurnModel;
  etpFinalDescentBurn: EtpFinalDescentBurnModel;
  etpPenalties: EtpPenaltyModel[];
  cruiseEtpProfile: CruiseEtpProfileModel;
  constructor(data?: Partial<EtpScenarioDetailModel>) {
    super(data);
    Object.assign(this, data);
    this.etpInitialDescent = new EtpInitialDescentModel(data?.etpInitialDescent);
    this.etpHold = new EtpHoldModel(data?.etpHold);
    this.etpMissedApproach = new EtpMissedApproachModel(data?.etpMissedApproach);
    this.etpApuBurn = new EtpApuBurnModel(data?.etpApuBurn);
    this.etpFinalDescentBurn = new EtpFinalDescentBurnModel(data?.etpFinalDescentBurn);
    this.etpPenalties = data?.etpPenalties?.map(a => new EtpPenaltyModel(a)) || [];
    this.cruiseEtpProfile = new CruiseEtpProfileModel(data?.cruiseEtpProfile);
  }

  static deserialize(apiData: IAPIEtpScenarioDetail): EtpScenarioDetailModel {
    if (!apiData) {
      return new EtpScenarioDetailModel();
    }
    const data: Partial<EtpScenarioDetailModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      status: StatusTypeModel.deserialize(apiData.status),
      etpInitialDescent: EtpInitialDescentModel.deserialize(apiData.etpInitialDescent),
      etpHold: EtpHoldModel.deserialize(apiData.etpHold),
      etpMissedApproach: EtpMissedApproachModel.deserialize(apiData.etpMissedApproach),
      etpApuBurn: EtpApuBurnModel.deserialize(apiData.etpapuBurn),
      etpFinalDescentBurn: EtpFinalDescentBurnModel.deserialize(apiData.etpFinalDescentBurn),
      etpPenalties: EtpPenaltyModel.deserializeList(apiData.etpPenalties),
      cruiseEtpProfile: CruiseEtpProfileModel.deserialize(apiData.etpCruiseProfile),
      etpScenarioEngine: SettingsTypeModel.deserialize({
        ...apiData.etpScenarioEngine,
        id: apiData.etpScenarioEngine?.etpScenarioEngineId,
      }),
      etpScenarioType: SettingsTypeModel.deserialize({
        ...apiData.etpScenarioType,
        id: apiData.etpScenarioType?.etpScenarioTypeId,
      }),
      etpTimeLimitType: SettingsTypeModel.deserialize({
        ...apiData.etpTimeLimitType,
        id: apiData.etpTimeLimitType?.etpTimeLimitTypeId,
      }),
      weightUom: SettingsTypeModel.deserialize({
        ...apiData.weightUOM,
        id: apiData.weightUOM?.weightUOMId,
      }),
    };
    return new EtpScenarioDetailModel(data);
  }

  public serialize(): IAPIEtpScenarioDetail {
    return {
      id: this.id,
      description: this.description,
      comments: this.comments,
      extRangeEntryPointRadius: Utilities.getNumberOrNullValue(this.extRangeEntryPointRadius),
      etpScenarioNumber: Number(this.etpScenarioNumber),
      nfpScenarioNumber: Number(this.nfpScenarioNumber),
      etpScenarioEngineId: this.etpScenarioEngine?.id,
      etpScenarioTypeId: this.etpScenarioType?.id,
      weightUOMId: this.weightUom?.id,
      etpTimeLimitTypeId: this.etpTimeLimitType?.id,
      etpInitialDescent: this.etpInitialDescent.serialize(),
      etpHold: this.etpHold.serialize(),
      etpMissedApproach: this.etpMissedApproach.serialize(),
      etpapuBurn: this.etpApuBurn.serialize(),
      etpFinalDescentBurn: this.etpFinalDescentBurn.serialize(),
      etpPenalties: this.getEtpPenalties(),
      etpCruiseProfile: this.cruiseEtpProfile.serialize(),
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  private getEtpPenalties(): IAPIEtpPenalty[] {
    if (this.etpPenalties && this.etpPenalties.length) {
      return this.etpPenalties.filter(x => x.biasFields)?.map(y => y.serialize());
    }
    return [];
  }

  static deserializeList(apiDataList: IAPIEtpScenarioDetail[]): EtpScenarioDetailModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEtpScenarioDetail) => EtpScenarioDetailModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
