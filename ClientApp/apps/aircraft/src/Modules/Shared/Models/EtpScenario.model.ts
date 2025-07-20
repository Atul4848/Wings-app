import { IAPIEtpScenario } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  SettingsTypeModel,
} from '@wings-shared/core';

@modelProtection
export class EtpScenarioModel extends CoreModel implements ISelectOption {
  etpScenarioNumber: number = null;
  nfpScenarioNumber: number = null;
  description: string = '';
  comments: string = '';
  extRangeEntryPointRadius: number = null;
  etpScenarioEngine: SettingsTypeModel;
  etpScenarioType: SettingsTypeModel;
  etpTimeLimitType: SettingsTypeModel;
  weightUom: SettingsTypeModel;
  constructor(data?: Partial<EtpScenarioModel>) {
    super(data);
    Object.assign(this, data);
    this.etpScenarioEngine = new SettingsTypeModel(data?.etpScenarioEngine);
    this.etpScenarioType = new SettingsTypeModel(data?.etpScenarioType);
    this.etpTimeLimitType = new SettingsTypeModel(data?.etpTimeLimitType);
    this.weightUom = new SettingsTypeModel(data?.weightUom);
  }

  static deserialize(apiData: IAPIEtpScenario): EtpScenarioModel {
    if (!apiData) {
      return new EtpScenarioModel();
    }
    const data: Partial<EtpScenarioModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      status: StatusTypeModel.deserialize(apiData.status),
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
    return new EtpScenarioModel(data);
  }

  public serialize(): IAPIEtpScenario {
    return {
      id: this.id,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      description: this.description,
      comments: this.comments,
      extRangeEntryPointRadius: Utilities.getNumberOrNullValue(this.extRangeEntryPointRadius),
      etpScenarioNumber: Number(this.etpScenarioNumber),
      nfpScenarioNumber: Number(this.nfpScenarioNumber),
      etpScenarioEngineId: this.etpScenarioEngine?.id,
      etpScenarioTypeId: this.etpScenarioType?.id,
      weightUOMId: this.weightUom?.id,
      etpTimeLimitTypeId: this.etpTimeLimitType?.id,
    };
  }

  static deserializeList(apiDataList: IAPIEtpScenario[]): EtpScenarioModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEtpScenario) => EtpScenarioModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.etpScenarioNumber?.toString() || '';
  }

  public get value(): string | number {
    return this.id;
  }
}
