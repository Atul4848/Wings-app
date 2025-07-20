import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAircraftRegistrySequenceBase } from './API-AircraftRegistrySequenceBase.interface';

export interface IAPIAircraftRegistry extends IBaseApiResponse {
  registry: string;
  registrationNationalityId: number;
  registrationNationalityCode: string;
  registryStartDate: string;
  registryEndDate: string;
  acas?: IAPIAcas;
  acasId: number;
  isDummyRegistry: boolean;
  airframe?: IAPIAircraftRegistryAirframe;
  airframeId: number;
  isOceanicClearanceEnabled: boolean;
  isPDCRegistered: boolean;
  usCustomsDecal?: IAPIUsCustomsDecal;
  weights?: IAPIWeights;
  distance?: IAPIDistance;
  item10A?: IAPIItem10A;
  item10B?: IAPIItem10B;
  item18?: IAPIItem18;
  item19?: IAPIItem19;
  windLimitation?: IAPIWindLimitation;
  wakeTurbulenceGroup?: IAPIWakeTurbulenceGroup;
  wakeTurbulenceGroupId: number
}

export interface IAPIDistance {
  minimumRunwayLength: number;
}

export interface IAPIWakeTurbulenceGroup extends IBaseApiResponse {
  wakeTurbulenceGroupId: number;
}

export interface IAPIUsCustomsDecal {
  number: number;
  expirationDate: string;
}

export interface IAPIWeights {
  bow: number;
  maxLandingWeight: number;
  tankCapacity: number;
  zeroFuelWeight: number;
  mtow: number;
}

export interface IAPIItem10A {
  isLORANC: boolean;
  isDME: boolean;
  isFMCWPRACARS: boolean;
  isFISACARS: boolean;
  isPDCACARS: boolean;
  isADF: boolean;
  isGNSS: boolean;
  isHFnumber: boolean;
  isInertialNavigation: boolean;
  isMLS: boolean;
  isILS: boolean;
  isSATVOICEINMARSAT: boolean;
  isSATVOICEMTSAT: boolean;
  isSATVOICEIRIDIUM: boolean;
  isVOR: boolean;
  isTACAN: boolean;
  isUHFRTF: boolean;
  isVHFRTF: boolean;
  is833KHz: boolean;
  isOther: boolean;
}

export interface IAPIItem10B {
  id: number;
  transponder: IAPITransponder;
}

export interface IAPIItem18 {
  id: number;
  aircraftAddressCode: string;
}

export interface IAPIItem19 {
  id: number;
  radios: IAPIAircraftRegistrySequenceBase[];
  usCustomsDecal: IAPIUsCustomsDecal;
  weights: IAPIWeights;
  distance: IAPIDistance;
  windLimitation: IAPIWindLimitation;
}

export interface IAPITransponder {
  id: number;
  name: string; 
  code: string;
}

export interface IAPIAcas {
  acasId: number;
  name: string;
}

export interface IAPIAircraftRegistryAirframe {
  airframeId: number;
  serialNumber: string;
}

export interface IAPIWindLimitation {
  maximumCrosswind: number;
  maximumTailwind: number;
}
