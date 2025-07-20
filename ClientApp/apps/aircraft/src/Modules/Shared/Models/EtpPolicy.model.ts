import { IAPIEtpPolicy } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
  SettingsTypeModel 
} from '@wings-shared/core';

@modelProtection
export class EtpPolicyModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';
  description: string = '';
  comments: string = '';
  etpScenarios: SettingsTypeModel[];

  constructor(data?: Partial<EtpPolicyModel>) {
    super(data);
    Object.assign(this, data);
    this.etpScenarios =
      data?.etpScenarios?.sort((a, b) => Number(a.label) - Number(b.label)).map(a => new SettingsTypeModel(a)) || [];
  }

  static deserialize(apiData: IAPIEtpPolicy): EtpPolicyModel {
    if (!apiData) {
      return new EtpPolicyModel();
    }
    const data: Partial<EtpPolicyModel> = {
      ...apiData,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpScenarios:
        apiData.etpScenarios?.map(a =>
          SettingsTypeModel.deserialize({ id: a.etpScenarioId, name: a.etpScenarioNumber.toString() })
        ) || [],
    };
    return new EtpPolicyModel(data);
  }

  public serialize(): IAPIEtpPolicy {
    return {
      id: this.id,
      code: this.code,
      comments: this.comments,
      description: this.description,
      etpScenarioIds: this.etpScenarios.map(a => a.id),
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || 1,
    };
  }

  static deserializeList(apiDataList: IAPIEtpPolicy[]): EtpPolicyModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEtpPolicy) => EtpPolicyModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
