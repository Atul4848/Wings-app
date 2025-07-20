import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirframeCapability } from '../Interfaces';

@modelProtection
export class AirframeCapabilityModel extends CoreModel {
  noiseChapter: SettingsTypeModel;
  minimumRunwayLengthInFeet?: number;
  rangeInNM?: number;
  rangeInMin?: number;
  maxCrossWindInKnots?: number;
  maxTailWindInKnots?: number;
  qcNoise?: number;
  approachEPNDb?: number;
  flyoverEPNDb?: number;
  lateralEPNDb?: number;
  cappsRange?: string = '';

  constructor(data?: Partial<AirframeCapabilityModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirframeCapability): AirframeCapabilityModel {
    if (!apiData) {
      return new AirframeCapabilityModel();
    }
    const data: Partial<AirframeCapabilityModel> = {
      ...apiData,
      id: apiData.airframeCapabilityId || apiData.id,
      minimumRunwayLengthInFeet: apiData.minimumRunwayLengthInFeet,
      rangeInNM: apiData.rangeInNM,
      rangeInMin: apiData.rangeInMin,
      maxCrossWindInKnots: apiData.maxCrossWindInKnots,
      maxTailWindInKnots: apiData.maxTailWindInKnots,
      qcNoise: apiData.qcNoise,
      approachEPNDb: apiData.approachEPNDb,
      flyoverEPNDb: apiData.flyoverEPNDb, 
      lateralEPNDb: apiData.lateralEPNDb,
      cappsRange: apiData.cappsRange,
      noiseChapter: SettingsTypeModel.deserialize({
        ...apiData.noiseChapter,
        id: apiData.noiseChapter?.noiseChapterId,
      }),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AirframeCapabilityModel(data);
  }

  static deserializeList(apiDataList: IAPIAirframeCapability[]): AirframeCapabilityModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirframeCapability) => AirframeCapabilityModel.deserialize(apiData))
      : [];
  }
}
