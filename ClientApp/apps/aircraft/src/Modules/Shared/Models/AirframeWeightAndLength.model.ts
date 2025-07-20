import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirframeWeightAndLength } from '../Interfaces';

@modelProtection
export class AirframeWeightAndLengthModel extends CoreModel {
  weightUOM: SettingsTypeModel;
  outerMainGearWheelSpan: SettingsTypeModel;
  distanceUOM: SettingsTypeModel;
  maxLandingWeight?: number;
  basicOperatingWeight?: number;
  bowCrewCount?: number;
  maxTakeOffWeight?: number;
  maxTakeOffFuel?: number;
  zeroFuelWeight?: number;
  aeroplaneReferenceFieldLength?: number;
  wingspan?: number;

  constructor(data?: Partial<AirframeWeightAndLengthModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirframeWeightAndLength): AirframeWeightAndLengthModel {
    if (!apiData) {
      return new AirframeWeightAndLengthModel();
    }
    const data: Partial<AirframeWeightAndLengthModel> = {
      ...apiData,
      id: apiData.airframeWeightAndLengthId || apiData.id,
      maxLandingWeight: apiData.maxLandingWeight,
      basicOperatingWeight: apiData.basicOperatingWeight,
      bowCrewCount: apiData.bowCrewCount,
      maxTakeOffWeight: apiData.maxTakeOffWeight,
      maxTakeOffFuel: apiData.maxTakeOffFuel,
      zeroFuelWeight: apiData.zeroFuelWeight,
      aeroplaneReferenceFieldLength: apiData.aeroplaneReferenceFieldLength,
      wingspan: apiData.wingspan,
      weightUOM: SettingsTypeModel.deserialize({
        ...apiData.weightUOM,
        id: apiData.weightUOM?.weightUOMId,
      }),
      outerMainGearWheelSpan: SettingsTypeModel.deserialize({
        ...apiData.outerMainGearWheelSpan,
        id: apiData.outerMainGearWheelSpan?.outerMainGearWheelSpanId,
      }),
      distanceUOM: SettingsTypeModel.deserialize({
        ...apiData.distanceUOM,
        id: apiData.distanceUOM?.distanceUOMId,
      }),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AirframeWeightAndLengthModel(data);
  }

  static deserializeList(apiDataList: IAPIAirframeWeightAndLength[]): AirframeWeightAndLengthModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAirframeWeightAndLength) => AirframeWeightAndLengthModel.deserialize(apiData))
      : [];
  }
}
