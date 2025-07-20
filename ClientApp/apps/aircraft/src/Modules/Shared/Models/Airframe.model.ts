import {
  CoreModel,
  ISelectOption,
  Utilities,
  modelProtection,
  SettingsTypeModel,
  SelectOption,
  EntityMapModel,
  IdNameCodeModel,
  getYesNoNullToBoolean,
} from '@wings-shared/core';
import { IAPIAirframe } from '../Interfaces';
import { AircraftVariationModel } from './AircraftVariration.model';
import { EngineSerialNumberModel } from './EngineSerialNumber.model';
import { AirframeCapabilityModel } from './AirframeCapability.model';
import { AirframeWeightAndLengthModel } from './AirframeWeightAndLength.model';
import { AirframeRegistryModel } from './AirframeRegistry.model';

@modelProtection
export class AirframeModel extends CoreModel implements ISelectOption {
  startDate: string = '';
  endDate: string = '';
  aircraftVariationId: number = null;
  serialNumber: string = null;
  manufactureDate: string = '';
  temporaryEngineDate: string = '';
  crewSeatCap: number = null;
  paxSeatCap: number = null;
  genericAircraftCode: string = '';
  airframeStatus: SettingsTypeModel;
  aircraftVariation: AircraftVariationModel;
  airworthinessRecentDate: string = '';
  airworthinessCertificateDate: string = '';
  isVerificationComplete: SelectOption;
  engineSerialNumbers: EngineSerialNumberModel[] = [];
  airframeCapability: AirframeCapabilityModel;
  airframeWeightAndLength: AirframeWeightAndLengthModel;
  acas: SettingsTypeModel;
  beacon406MHzELTId: string;
  aircraftNationalityId: number;
  aircraftNationalityCode: string;
  aircraftNationalityName: string;
  aircraftNationality: IdNameCodeModel;
  tirePressureMain?: number;
  tirePressureNose?: number;
  seatConfiguration: string;
  airframeUplinkVendors: EntityMapModel[] = [];
  airframeCateringHeatingElements: EntityMapModel[] = [];
  airframeRegistry: AirframeRegistryModel;
  airframeRegistries: AirframeRegistryModel[] = [];
  registries?: SettingsTypeModel[] = [];
  isVerified?: boolean = false;

  constructor(data?: Partial<AirframeModel>) {
    super(data);
    Object.assign(this, data);
    this.airframeStatus = data?.airframeStatus ? new SettingsTypeModel(data?.airframeStatus) : null;
    this.aircraftVariation = data?.aircraftVariation ? new AircraftVariationModel(data?.aircraftVariation) : null;
  }

  static deserialize(apiData: IAPIAirframe): AirframeModel {
    if (!apiData) {
      return new AirframeModel();
    }
    const data: Partial<AirframeModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airframeId || apiData.id,
      airframeStatus: SettingsTypeModel.deserialize({
        ...apiData.airframeStatus,
        id: apiData.airframeStatus?.airframeStatusId,
      }),
      aircraftVariation: AircraftVariationModel.deserialize(apiData.aircraftVariation),
      isVerificationComplete: new SelectOption({
        value: apiData.isVerificationComplete,
        name: apiData.isVerificationComplete ? 'Yes' : 'No',
      }),
      engineSerialNumbers: EngineSerialNumberModel.deserializeList(apiData.engineSerialNumbers),
      airframeCapability: AirframeCapabilityModel.deserialize(apiData.airframeCapability),
      airframeWeightAndLength: AirframeWeightAndLengthModel.deserialize(apiData.airframeWeightAndLength),
      aircraftNationality: IdNameCodeModel.deserialize({
        id: apiData.aircraftNationalityId,
        name: apiData.aircraftNationalityName,
        code: apiData.aircraftNationalityCode,
      }),
      acas: SettingsTypeModel.deserialize({
        ...apiData.acas,
        id: apiData.acas?.acasId,
      }),
      airframeUplinkVendors: apiData.airframeUplinkVendors?.map(
        entity =>
          new EntityMapModel({
            id: entity.airframeUplinkVendorId || entity.id,
            entityId: entity.uplinkVendor.uplinkVendorId,
            name: entity.uplinkVendor.name,
          })
      ),
      airframeCateringHeatingElements: apiData.airframeCateringHeatingElements?.map(
        entity =>
          new EntityMapModel({
            id: entity.airframeCateringHeatingElementId || entity.id,
            entityId: entity.cateringHeatingElement.cateringHeatingElementId,
            name: entity.cateringHeatingElement.name,
          })
      ),
      airframeRegistry: AirframeRegistryModel.deserialize(apiData.airframeRegistry),
      registries: apiData.airframeRegistries?.map(
        item =>
          new SettingsTypeModel({
            id: item.registry.id,
            name: item.registry.name,
          })
      ),
      airframeRegistries: AirframeRegistryModel.deserializeList(apiData.airframeRegistries),
      isVerified: Boolean(apiData.isVerificationComplete),
    };
    return new AirframeModel(data);
  }

  public serialize(): IAPIAirframe {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
      id: this.id,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || 1,
      aircraftVariationId: this.aircraftVariation?.id,
      serialNumber: this.serialNumber,
      manufactureDate: this.manufactureDate || null,
      crewSeatCap: Number(this.crewSeatCap),
      paxSeatCap: Number(this.paxSeatCap),
      airframeStatusId: this.airframeStatus?.id,
      airworthinessRecentDate: this.airworthinessRecentDate || null,
      airworthinessCertificateDate: this.airworthinessCertificateDate || null,
      isVerificationComplete: this.isVerificationComplete.value,
      acasId: this.acas.id,
      seatConfiguration: this.seatConfiguration,
      noiseChapterId: this.airframeCapability.noiseChapter?.id,
      beacon406MHzELTID: this.beacon406MHzELTId,
      aircraftNationalityId: this.aircraftNationality?.id,
      aircraftNationalityName: this.aircraftNationality?.name,
      aircraftNationalityCode: this.aircraftNationality?.code,
      maxLandingWeight: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.maxLandingWeight),
      basicOperatingWeight: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.basicOperatingWeight),
      bowCrewCount: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.bowCrewCount),
      maxTakeOffWeight: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.maxTakeOffWeight),
      maxTakeOffFuel: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.maxTakeOffFuel),
      zeroFuelWeight: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.zeroFuelWeight),
      weightUOMId: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.weightUOM?.id),
      aeroplaneReferenceFieldLength: Utilities.getNumberOrNullValue(
        this.airframeWeightAndLength?.aeroplaneReferenceFieldLength
      ),
      wingspan: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.wingspan),
      outerMainGearWheelSpanId: Utilities.getNumberOrNullValue(
        this.airframeWeightAndLength?.outerMainGearWheelSpan?.id
      ),
      distanceUOMId: Utilities.getNumberOrNullValue(this.airframeWeightAndLength?.distanceUOM?.id),
      minimumRunwayLengthInFeet: Utilities.getNumberOrNullValue(this.airframeCapability?.minimumRunwayLengthInFeet),
      rangeInNM: Utilities.getNumberOrNullValue(this.airframeCapability?.rangeInNM),
      rangeInMinute: Utilities.getNumberOrNullValue(this.airframeCapability?.rangeInMin),
      maxCrossWindInKnots: Utilities.getNumberOrNullValue(this.airframeCapability?.maxCrossWindInKnots),
      maxTailWindInKnots: Utilities.getNumberOrNullValue(this.airframeCapability?.maxTailWindInKnots),
      qcNoise: Utilities.getNumberOrNullValue(this.airframeCapability?.qcNoise),
      approachEPNDb: Utilities.getNumberOrNullValue(this.airframeCapability?.approachEPNDb),
      flyoverEPNDb: Utilities.getNumberOrNullValue(this.airframeCapability?.flyoverEPNDb),
      lateralEPNDb: Utilities.getNumberOrNullValue(this.airframeCapability?.lateralEPNDb),
      cappsRange: this.airframeCapability?.cappsRange,
      tirePressureMain: this.tirePressureMain,
      tirePressureNose: this.tirePressureNose,
      engineSerialNumbers: this.engineSerialNumbers.map(x => ({
        ...x,
        engineSerialNumberId: x.id || 0,
        airframeId: this.id || 0,
        temporaryEngineDate: x.temporaryEngineDate || null,
      })),
      uplinkVendors: this.airframeUplinkVendors.map(x => x.entityId),
      cateringHeatingElements: this.airframeCateringHeatingElements.map(x => x.entityId),
      airframeRegistries: this.airframeRegistries.map(r => ({
        ...r.serialize(),
        airframeId: this.id,
      })),
    };
  }

  static deserializeList(apiDataList: IAPIAirframe[]): AirframeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIAirframe) => AirframeModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
