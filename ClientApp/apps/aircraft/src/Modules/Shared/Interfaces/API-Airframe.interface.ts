import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAirframeRegistry } from './API-AirframeRegistry.interface';
import { IAPIAircraftVariation } from './API-AircraftVariation.interface';

export interface IAPIAirframe extends IBaseApiResponse {
  airframeId?: number;
  startDate: string;
  endDate: string;
  id: number;
  aircraftVariationId: number;
  serialNumber: string;
  manufactureDate: string;
  crewSeatCap: number;
  paxSeatCap: number;
  aircraftVariation?: IAPIAircraftVariation;
  airframeStatus?: IAPIAirframeStatus;
  airframeStatusId: number;
  airworthinessRecentDate: string;
  airworthinessCertificateDate: string;
  isVerificationComplete: string | number | boolean;
  engineSerialNumbers: IAPIEngineSerialNumber[];
  airframeCapability?: IAPIAirframeCapability;
  airframeWeightAndLength?: IAPIAirframeWeightAndLength;
  acas?: IAPIACAS;
  acasId?: number;
  noiseChapterId?: number;
  beacon406MHzELTId?: string;
  beacon406MHzELTID?: string;
  aircraftNationalityId: number;
  aircraftNationalityCode: string;
  aircraftNationalityName: string;
  tirePressureMain?: number;
  tirePressureNose?: number;
  seatConfiguration: string;
  airframeUplinkVendors?: IAPIAirframeUplinkVendor[];
  uplinkVendors?: number[];
  airframeCateringHeatingElements?: IAPIAirframeCateringHeatingElement[];
  cateringHeatingElements?: number[];
  maxLandingWeight?: number;
  basicOperatingWeight?: number;
  bowCrewCount?: number;
  maxTakeOffWeight?: number;
  maxTakeOffFuel?: number;
  zeroFuelWeight?: number;
  weightUOMId?: number;
  aeroplaneReferenceFieldLength?: number;
  wingspan?: number;
  outerMainGearWheelSpanId?: number;
  distanceUOMId?: number;
  minimumRunwayLengthInFeet?: number;
  rangeInNM?: number;
  rangeInMinute?: number;
  maxCrossWindInKnots?: number;
  maxTailWindInKnots?: number;
  qcNoise?: number;
  approachEPNDb?: number;
  flyoverEPNDb?: number;
  lateralEPNDb?: number;
  airframeRegistry?: IAPIAirframeRegistry;
  airframeRegistries: IAPIAirframeRegistry[];
  cappsRange?: string;
}

export interface IAPIEngineSerialNumber extends IBaseApiResponse {
  airframeId?: number;
  engineSerialNumberId?: number;
  serialNumber: string;
  isTemporaryEngine: boolean;
  temporaryEngineDate?: string;
}

export interface IAPIAirframeCapability extends IBaseApiResponse {
  airframeCapabilityId: number;
  noiseChapter: IAPINoiseChapter;
  minimumRunwayLengthInFeet?: number;
  rangeInNM?: number;
  rangeInMin?: number;
  maxCrossWindInKnots?: number;
  maxTailWindInKnots?: number;
  qcNoise?: number;
  approachEPNDb?: number;
  flyoverEPNDb?: number;
  lateralEPNDb?: number;
  cappsRange?: string;
}

export interface IAPIAirframeWeightAndLength extends IBaseApiResponse {
  airframeWeightAndLengthId: number;
  weightUOM: IAPIWeightUOM;
  outerMainGearWheelSpan: IAPIOuterMainGearWheelSpan;
  distanceUOM: IAPIDistanceUOM;
  maxLandingWeight?: number;
  basicOperatingWeight?: number;
  bowCrewCount?: number;
  maxTakeOffWeight?: number;
  maxTakeOffFuel?: number;
  zeroFuelWeight?: number;
  aeroplaneReferenceFieldLength?: number;
  wingspan?: number;
}

export interface IAPIWeightUOM extends IBaseApiResponse {
  weightUOMId: number;
  name: string;
}

export interface IAPIOuterMainGearWheelSpan extends IBaseApiResponse {
  outerMainGearWheelSpanId: number;
  name: string;
}

export interface IAPIDistanceUOM extends IBaseApiResponse {
  distanceUOMId: number;
  name: string;
}

export interface IAPIACAS extends IBaseApiResponse {
  acasId: number;
}

export interface IAPIAirframeUplinkVendor extends IBaseApiResponse {
  airframeUplinkVendorId: number;
  uplinkVendor: IAPIUplinkVendor;
}

interface IAPIUplinkVendor extends IBaseApiResponse {
  uplinkVendorId: number;
  name: string;
}

interface IAPIAirframeCateringHeatingElement extends IBaseApiResponse {
  airframeCateringHeatingElementId: number;
  cateringHeatingElement: IAPICateringHeatingElement;
}

interface IAPICateringHeatingElement extends IBaseApiResponse {
  cateringHeatingElementId: number;
  name: string;
}

interface IAPIAirframeStatus extends IBaseApiResponse {
  airframeStatusId?: number;
}

interface IAPINoiseChapter extends IBaseApiResponse {
  noiseChapterId?: number;
}

export interface IAPIRaimReceiverType extends IBaseApiResponse {
  raimReceiverTypeId?: number;
}

export interface IAPIRaimReportType extends IBaseApiResponse {
  raimReportTypeId?: number;
}

export interface IAPIAirframeEngine extends IBaseApiResponse {
  airframeEngineId?: number;
  engineSerialNumber: string;
}
