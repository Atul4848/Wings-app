import {
  CoreModel,
  getYesNoNullToBoolean,
  IdNameCodeModel,
  modelProtection,
  SettingsTypeModel,
  StatusTypeModel,
} from '@wings-shared/core';
import { IAPIAirframeRegistry } from '../Interfaces';

@modelProtection
export class AirframeRegistryModel extends CoreModel {
  airframeId: number;
  registry: SettingsTypeModel;
  registrationNationality: IdNameCodeModel;
  carrierCode: string = null;
  isOutOffOnIn: boolean = null;
  callSign: string = '';
  isFlightAwareTracking: boolean = null;
  startDate: string = null;
  endDate: string = null;

  constructor(data?: Partial<AirframeRegistryModel>) {
    super(data);
    Object.assign(this, data);
    this.registrationNationality = data?.registrationNationality
      ? new IdNameCodeModel(data?.registrationNationality)
      : null;
  }

  static deserialize(apiData: IAPIAirframeRegistry): AirframeRegistryModel {
    if (!apiData) {
      return new AirframeRegistryModel();
    }
    const data: Partial<AirframeRegistryModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airframeRegistryId || apiData.id,
      airframeId: apiData.airframeId,
      registry: SettingsTypeModel.deserialize({
        ...apiData.registry,
        name: apiData.registry?.name,
        id: apiData.registry?.registryId,
      }),
      registrationNationality: IdNameCodeModel.deserialize({
        id: apiData.registrationNationalityId,
        name: apiData.registrationNationalityName,
        code: apiData.registrationNationalityCode,
      }),
    };
    return new AirframeRegistryModel(data);
  }

  public serialize(): IAPIAirframeRegistry {
    return {
      id: this.id || 0,
      airframeId: this.airframeId,
      registryId: this.registry.id,
      registryName: this.registry.name,
      registrationNationalityId: this.registrationNationality.id,
      registrationNationalityName: this.registrationNationality.name,
      registrationNationalityCode: this.registrationNationality.code,
      carrierCode: this.carrierCode,
      isOutOffOnIn: getYesNoNullToBoolean(this.isOutOffOnIn),
      callSign: this.callSign,
      isFlightAwareTracking: getYesNoNullToBoolean(this.isFlightAwareTracking),
      startDate: this.startDate,
      endDate: this.endDate || null,
      statusId: this.status?.value,
    };
  }

  static deserializeList(apiDataList: IAPIAirframeRegistry[]): AirframeRegistryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirframeRegistry) => AirframeRegistryModel.deserialize(apiData))
      : [];
  }
}
