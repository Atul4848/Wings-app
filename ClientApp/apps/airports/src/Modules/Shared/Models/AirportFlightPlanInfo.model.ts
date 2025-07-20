import { CoreModel, EntityMapModel, IdNameCodeModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportFlightPlanInfoRequest, IAPIAirportFlightPlanInfoResponse } from '../Interfaces';

@modelProtection
export class AirportFlightPlanInfoModel extends CoreModel {
  id: number = 0;
  airportId: number;
  navBlueCode: string = null;
  apgCode: string = null;
  fplzzzzItem18: string = '';
  fplzzzz: boolean = false;
  isVFRAirport: boolean = false;
  isACDMAirport: boolean = false;
  isEuroControlFPLACDMAirport: boolean = false;
  isCompositeFlightPlanRequired: boolean = false;
  fpAirspace: IdNameCodeModel;
  appliedDestAltTOFs: EntityMapModel[] = [];

  constructor(data?: Partial<AirportFlightPlanInfoModel>) {
    super(data);
    Object.assign(this, data);
  }

  public static deserialize(apiData: IAPIAirportFlightPlanInfoResponse): AirportFlightPlanInfoModel {
    if (!apiData) {
      return new AirportFlightPlanInfoModel();
    }
    const data: Partial<AirportFlightPlanInfoModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportFlightPlanInfoId || apiData.id || 0,
      airportId: apiData.airportId,
      fplzzzz: apiData.fplzzzz,
      fplzzzzItem18: apiData.fplzzzzItem18,
      isACDMAirport: apiData.isACDMAirport,
      isEuroControlFPLACDMAirport: apiData.isEuroControlFPLACDMAirport,
      isCompositeFlightPlanRequired: apiData.isCompositeFlightPlanRequired,
      isVFRAirport: apiData.isVFRAirport,
      navBlueCode: apiData.navBlueCode,
      apgCode: apiData.apgCode,
      fpAirspace: new IdNameCodeModel({
        id: apiData?.fpAirspaceId,
        name: apiData?.fpAirspaceName,
        code: apiData?.fpAirspaceCode,
      }),
      appliedDestAltTOFs: apiData.appliedDestAltTOFs?.map(
        entity =>
          new EntityMapModel({
            entityId: entity.id,
            id: entity.destAltTOF?.destAltTOFId,
            name: entity.destAltTOF?.name,
            code: entity.destAltTOF?.code,
          })
      ),
    };
    return new AirportFlightPlanInfoModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportFlightPlanInfoRequest {
    return {
      id: this.id,
      airportId: this.airportId,
      navBlueCode: this.navBlueCode || null,
      apgCode: this.apgCode || null,
      fplzzzzItem18: this.fplzzzzItem18,
      fplzzzz: this.fplzzzz,
      isVFRAirport: this.isVFRAirport,
      isCompositeFlightPlanRequired: this.isCompositeFlightPlanRequired,
      isACDMAirport: this.isACDMAirport || false,
      isEuroControlFPLACDMAirport: this.isEuroControlFPLACDMAirport || false,
      fpAirspaceId: this.fpAirspace?.id,
      fpAirspaceCode: this.fpAirspace?.code,
      fpAirspaceName: this.fpAirspace?.name,
      appliedDestAltTOFs: this.appliedDestAltTOFs?.map(entity => {
        return {
          id: entity.entityId || 0,
          destAltTOFId: entity.id,
        };
      }),
    };
  }

  public static deserializeList(
    airportFlightPlanList: IAPIAirportFlightPlanInfoResponse[]
  ): AirportFlightPlanInfoModel[] {
    return airportFlightPlanList
      ? airportFlightPlanList.map((airportFlightPlan: IAPIAirportFlightPlanInfo) =>
        AirportFlightPlanInfoModel.deserialize(airportFlightPlan)
      )
      : [];
  }
}
