import { IAPIState, IAPIStateRequest } from '../Interfaces';
import { CountryModel } from './index';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
  SettingsTypeModel,
  Utilities
} from '@wings-shared/core';

@modelProtection
export class StateModel extends CoreModel implements ISelectOption {
  officialName: string = '';
  commonName: string = '';
  countryId: number = 0;
  country: CountryModel;
  mapRegion: string = '';
  isoCode: string = '';
  statusChangeReason: string = '';
  stateType: SettingsTypeModel;
  cappsName: string = '';
  code: string = '';
  cappsCode: string = '';
  startDate: string = '';
  endDate: string = '';
  syncToCAPPS: boolean = false;
  // required for bulletins
  stateCode: string;

  constructor(data?: Partial<StateModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new CountryModel(data?.country);
    this.stateType = new SettingsTypeModel(data?.stateType);
  }

  static deserialize(apiState: IAPIState): StateModel {
    if (!apiState) {
      return new StateModel();
    }
    const data: Partial<StateModel> = {
      ...apiState,
      ...CoreModel.deserializeAuditFields(apiState),
      id: apiState.stateId || apiState.id,
      officialName: apiState.name || apiState.stateName || apiState.officialName,
      commonName: apiState.commonName || apiState.name || apiState.stateName,
      code: apiState.code || apiState.stateCode || apiState.isoCode,
      isoCode: apiState.isoCode || apiState.isoStateCode,
      stateCode: apiState.code,
      startDate: apiState.startDate,
      endDate: apiState.endDate,
      syncToCAPPS: apiState.syncToCAPPS,
      countryId: apiState.countryId,
      country: CountryModel.deserialize(apiState.country),
      mapRegion: apiState.mapRegion,
      statusId: apiState.status ? apiState.status.id : apiState.statusId,
      statusChangeReason: apiState.statusChangeReason,
      cappsName: apiState.cappsName || apiState.cappsStateName,
      cappsCode: apiState.cappsCode || apiState.cappsStateCode || apiState.code,
      stateType: SettingsTypeModel.deserialize({
        id: apiState.stateType?.stateTypeId,
        name: apiState.stateType?.name,
      }),
      status: StatusTypeModel.deserialize(apiState.status),
      accessLevel: AccessLevelModel.deserialize(apiState.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiState.sourceType),
    };
    return new StateModel(data);
  }

  public serialize(): IAPIStateRequest {
    return {
      id: this.id,
      countryId: this.country.id,
      officialName: this.officialName,
      commonName: this.commonName,
      code: this.code,
      isoCode: this.isoCode,
      stateTypeId: this.stateType.id,
      cappsName: this.cappsName,
      cappsCode: this.cappsCode,
      statusChangeReason: this.statusChangeReason,
      syncToCAPPS: this.syncToCAPPS,
      statusId: Utilities.getNumberOrNullValue(this.status.value),
      accessLevelId: this.accessLevel.id,
      sourceTypeId: this.sourceType?.id,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  static deserializeList(apiPersonList: IAPIState[]): StateModel[] {
    return apiPersonList ? apiPersonList.map((apiPerson: IAPIState) => StateModel.deserialize(apiPerson)) : [];
  }

  public get entityCode(): string {
    return this.isoCode || this.code || this.cappsCode;
  }

  // required in auto complete
  public get label(): string {
    if (Boolean(this.commonName) && Boolean(this.entityCode)) {
      return `${this.commonName} ${`(${this.entityCode})`}`;
    }

    return Boolean(this.commonName) && !Boolean(this.entityCode) ? this.commonName : this.entityCode;
  }

  // required in auto complete
  public get labelWithCappsCode(): string {
    if (this.commonName && this.cappsCode) {
      return `${this.commonName} (${this.cappsCode})`;
    }
    return this.commonName || this.cappsCode;
  }

  public get value(): number {
    return this.id;
  }
}
