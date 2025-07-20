import { IAPIAirportMappingsBeta } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { ICAOCodeModel } from './ICAOCode.model';
import { AirportFlightPlanInfoModel } from './AirportFlightPlanInfo.model';
import { AirportCodeSettingsModel } from './AirportCodeSettings.model';

@modelProtection
export class AirportMappingsBetaModel extends IdNameModel {
  icaoCode: ICAOCodeModel;
  faaCode: string = '';
  airportFlightPlanInfo?: AirportFlightPlanInfoModel;
  uwaAirportCode: AirportCodeSettingsModel;
  regionalAirportCode: AirportCodeSettingsModel;

  constructor(data?: Partial<AirportMappingsBetaModel>) {
    super();
    Object.assign(this, data);
    this.airportFlightPlanInfo = AirportFlightPlanInfoModel.deserialize({
      ...data.airportFlightPlanInfo,
      airportId: data.airportFlightPlanInfo?.airportId,
    });
    this.uwaAirportCode = data?.uwaAirportCode ? new AirportCodeSettingsModel(data?.uwaAirportCode) : null;
    this.regionalAirportCode = data?.regionalAirportCode
      ? new AirportCodeSettingsModel(data?.regionalAirportCode)
      : null;
  }

  public static deserialize(apiData: IAPIAirportMappingsBeta): AirportMappingsBetaModel {
    if (!apiData) {
      return new AirportMappingsBetaModel();
    }
    const data: Partial<AirportMappingsBetaModel> = {
      id: apiData._id || apiData.id,
      icaoCode: ICAOCodeModel.deserialize(apiData.icaoCode),
      faaCode: apiData.faaCode,
      airportFlightPlanInfo: AirportFlightPlanInfoModel.deserialize({
        ...apiData.airportFlightPlanInfo,
        airportId: apiData.airportId,
      }),
      uwaAirportCode: apiData.uwaAirportCode
        ? new AirportCodeSettingsModel({
          ...apiData.uwaAirportCode,
          id: apiData.uwaAirportCode.uwaAirportCodeId || apiData.uwaAirportCode.id,
        })
        : null,
      regionalAirportCode: apiData.regionalAirportCode
        ? new AirportCodeSettingsModel({
          ...apiData.regionalAirportCode,
          id: apiData.regionalAirportCode.regionalAirportCodeId || apiData.regionalAirportCode.id,
        })
        : null,
    };
    return new AirportMappingsBetaModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportMappingsBeta {
    return {
      id: this.id,
      icaoCode: this.icaoCode,
      faaCode: this.faaCode,
      airportFlightPlanInfo: this.airportFlightPlanInfo,
      uwaAirportCodeId: this.uwaAirportCode?.id,
      regionalAirportCodeId: this.regionalAirportCode?.id,
    };
  }

  public static deserializeList(airportMappingList: IAPIAirportMappingsBeta[]): AirportMappingsBetaModel[] {
    return airportMappingList
      ? airportMappingList.map((airportMappings: IAPIAirportMappingsBeta) =>
        AirportMappingsBetaModel.deserialize(airportMappings)
      )
      : [];
  }
}
