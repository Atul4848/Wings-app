import { CoreModel, EntityMapModel, IdNameCodeModel, Utilities } from '@wings-shared/core';
import {
  IAPIFlightPlanning,
  IAPIFlightPlanningRequest,
} from '../Interfaces';
import { FlightPlanningACASGridModel } from './FlightPlanningACASGrid.model';

export class FlightPlanningModel extends CoreModel {
  acasiiEquippedTCASVersion?: string = '';
  tcasRqrdFL?: number = null;
  rvsmSeparationMin?: number = null;
  rvsmLowerFL?: number = null;
  rvsmUpperFL?: number = null;
  rvsmItem10: boolean = false;
  is833KHzChnlSpaceRqrd: boolean = false;
  adsbRqrdAboveFL?: number = null;
  country: IdNameCodeModel;
  acasiIdataIsRqrd?: boolean = false;
  acasiiOrTCAS?: EntityMapModel[] = [];
  rvsmComplianceExceptions?: EntityMapModel[] = [];
  bannedAircrafts?: EntityMapModel[] = [];
  noiseRestrictedAircrafts?: EntityMapModel[] = [];
  documentsRequiredforFilings?: EntityMapModel[] = [];
  appliedItem18Contents?: EntityMapModel[] = [];
  appliedRequiredAircraftEquipments?: EntityMapModel[] = [];
  acasiiAdditionalInformations?: FlightPlanningACASGridModel[] = [];
  countryId?: number;

  constructor(data?: Partial<FlightPlanningModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFlightPlanning): FlightPlanningModel {
    if (!apiData) {
      return new FlightPlanningModel();
    }

    return new FlightPlanningModel({
      ...CoreModel.deserializeAuditFields(apiData),
      ...apiData,
      id: apiData.id,
      acasiiEquippedTCASVersion: apiData.acasiiEquippedTCASVersion,
      tcasRqrdFL: apiData.tcasRqrdFL,
      rvsmSeparationMin: apiData.rvsmSeparationMin,
      rvsmLowerFL: apiData.rvsmLowerFL,
      rvsmUpperFL: apiData.rvsmUpperFL,
      rvsmItem10: apiData.rvsmItem10,
      is833KHzChnlSpaceRqrd: apiData.is833KHzChnlSpaceRqrd,
      adsbRqrdAboveFL: apiData.adsbRqrdAboveFL,
      acasiIdataIsRqrd: apiData.acasiIdataIsRqrd,
      acasiiAdditionalInformations: FlightPlanningACASGridModel.deserializeList(apiData.acasiiAdditionalInformations),
      acasiiOrTCAS: apiData.acasiiOrTCAS?.map(
        entity =>
          new EntityMapModel({
            entityId: entity.flightOperationalCategoryId,
            id: entity.id,
            name: entity.name,
          })
      ),
      rvsmComplianceExceptions: apiData.rvsmComplianceExceptions?.map(
        entity =>
          new EntityMapModel({
            entityId: entity?.purposeOfFlightId,
            id: entity.id,
            name: entity.name,
          })
      ),
      bannedAircrafts: apiData.bannedAircrafts?.map(
        entity =>
          new EntityMapModel({
            entityId: entity.aircraftICAOTypeDesignatorId,
            id: entity.id,
            name: entity.name,
          })
      ),
      noiseRestrictedAircrafts: apiData.noiseRestrictedAircrafts?.map(
        entity =>
          new EntityMapModel({
            entityId: entity.noiseChapterId,
            id: entity.id,
            name: entity.name,
          })
      ),
      documentsRequiredforFilings: apiData.documentsRequiredforFilings?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.permitDocumentId,
            name: entity.name,
            code: entity.code,
          })
      ),
      appliedItem18Contents: apiData.appliedItem18Contents?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.item18Content?.item18ContentId,
            name: entity.item18Content?.name,
          })
      ),
      appliedRequiredAircraftEquipments: apiData.appliedRequiredAircraftEquipments?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.aircraftEquipment?.aircraftEquipmentId,
            name: entity.aircraftEquipment?.name,
          })
      ),
    });
  }

  static deserializeList(apiDataList: IAPIFlightPlanning[]): FlightPlanningModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIFlightPlanning) => FlightPlanningModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIFlightPlanningRequest {
    return {
      id: this.id || 0,
      countryId: this.country?.id || this.countryId,
      acasiiEquippedTCASVersion: this.acasiiEquippedTCASVersion,
      tcasRqrdFL: Utilities.getNumberOrNullValue(this.tcasRqrdFL),
      rvsmSeparationMin: Utilities.getNumberOrNullValue(this.rvsmSeparationMin),
      rvsmLowerFL: Utilities.getNumberOrNullValue(this.rvsmLowerFL),
      rvsmUpperFL: Utilities.getNumberOrNullValue(this.rvsmUpperFL),
      rvsmItem10: this.rvsmItem10,
      is833KHzChnlSpaceRqrd: this.is833KHzChnlSpaceRqrd,
      adsbRqrdAboveFL: Utilities.getNumberOrNullValue(this.adsbRqrdAboveFL),
      acasiIdataIsRqrd: this.acasiIdataIsRqrd,
      acasiiAdditionalInformations: this.acasiiAdditionalInformations?.map(acasiiInfo => acasiiInfo.serialize()),
      acasiiOrTCAS: this.acasiiOrTCAS?.map(x => ({
        id: x.id,
        flightOperationalCategoryId: x.entityId || 0,
        name: x.name,
      })),
      rvsmComplianceExceptions: this.rvsmComplianceExceptions?.map(x => ({
        id: x.id,
        purposeOfFlightId: x.entityId || 0,
        name: x.name,
      })),
      bannedAircrafts: this.bannedAircrafts?.map(x => ({
        id: x.id,
        aircraftICAOTypeDesignatorId: x.entityId || 0,
        name: x.name,
      })),
      noiseRestrictedAircrafts: this.noiseRestrictedAircrafts?.map(x => ({
        id: x.id,
        noiseChapterId: x.entityId || 0,
        name: x.name,
      })),
      documentsRequiredforFilings: this.documentsRequiredforFilings?.map(x => ({
        id: x.id,
        permitDocumentId: x.entityId,
        name: x.name,
        code: x.code,
      })),
      appliedRequiredAircraftEquipments: this.appliedRequiredAircraftEquipments?.map(x => ({
        aircraftEquipmentId: x.entityId,
        id: x.id,
      })),
      appliedItem18Contents: this.appliedItem18Contents?.map(x => ({
        item18ContentId: x.entityId,
        id: x.id,
      })),
    };
  }
}
