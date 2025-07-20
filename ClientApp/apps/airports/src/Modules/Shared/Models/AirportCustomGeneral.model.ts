import { CoreModel, EntityMapModel, modelProtection, IdNameCodeModel, getYesNoNullToBoolean } from '@wings-shared/core';
import { IAPIAirportCustomGeneral, IAPIAirportCustomGeneralRequest } from '../Interfaces';

@modelProtection
export class AirportCustomGeneralModel extends CoreModel {
  customsGeneralInformationId: number;
  airportId: number;
  customsAvailableAtAirport: boolean = null;
  clearanceLocationSpecifics: string = '';
  gaClearanceAvailable: boolean = null;
  maximumPersonsOnBoardAllowedForGAClearance: number;
  customsOfficerDispatchedFromAirportId: number;
  customOfficerDispacthedFromAirport: EntityMapModel;
  appliedCustomsLocationInformations: EntityMapModel[];
  customsClearanceFBOs: EntityMapModel[];
  appliedMaxPOBAltClearanceOptions: EntityMapModel[];
  maxPOBNotes: string = '';

  constructor(data?: Partial<AirportCustomGeneralModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportCustomGeneral): AirportCustomGeneralModel {
    if (!apiData) {
      return new AirportCustomGeneralModel();
    }
    const data: Partial<AirportCustomGeneralModel> = {
      ...apiData,
      id: apiData.customsGeneralInformationId || apiData.id,
      maxPOBNotes: apiData.maximumPersonsOnBoardAllowedForGAClearanceNotes,
      customOfficerDispacthedFromAirport: apiData.customOfficerDispatchedFromAirport
        ? new EntityMapModel({
          id: apiData.customOfficerDispatchedFromAirport.airportId,
          name: apiData.customOfficerDispatchedFromAirport.airportName,
          code: apiData.customOfficerDispatchedFromAirport.displayCode,
        })
        : null,
      customsClearanceFBOs: apiData.customsClearanceFBOs?.map(
        entity =>
          new EntityMapModel({
            id: entity.customsClearanceFBOId || entity.id,
            entityId: entity.clearanceFBOId,
            name: entity.clearanceFBOName,
            code: entity.clearanceFBOCode,
          })
      ),
      appliedCustomsLocationInformations: apiData.appliedCustomsLocationInformations?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedCustomsLocationInformationId || entity.id,
            entityId: entity.customsLocationInformation.customsLocationInformationId,
            name: entity.customsLocationInformation.name,
          })
      ),
      appliedMaxPOBAltClearanceOptions: apiData.appliedMaxPOBAltClearanceOptions?.map(
        entity =>
          new EntityMapModel({
            id: entity.appliedMaxPOBAltClearanceOptionId || entity.id,
            entityId: entity.maxPOBAltClearanceOption.maxPOBAltClearanceOptionId,
            name: entity.maxPOBAltClearanceOption.name,
          })
      ),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AirportCustomGeneralModel(data);
  }

  static deserializeList(apiDataList: IAPIAirportCustomGeneral[]): AirportCustomGeneralModel[] {
    return apiDataList ? apiDataList.map(apiData => AirportCustomGeneralModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IAPIAirportCustomGeneralRequest {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      customsAvailableAtAirport: getYesNoNullToBoolean(this.customsAvailableAtAirport),
      customsOfficerDispatchedFromAirportId: this.customOfficerDispacthedFromAirport?.id || null,
      clearanceLocationSpecifics: this.clearanceLocationSpecifics ? this.clearanceLocationSpecifics : null,
      gaClearanceAvailable: getYesNoNullToBoolean(this.gaClearanceAvailable),
      maximumPersonsOnBoardAllowedForGAClearance: Number(this.maximumPersonsOnBoardAllowedForGAClearance) || null,
      maximumPersonsOnBoardAllowedForGAClearanceNotes:this.maxPOBNotes,
      appliedMaxPOBAltClearanceOptions: this.appliedMaxPOBAltClearanceOptions
        ? this.appliedMaxPOBAltClearanceOptions?.map(entity => ({
          id: entity.id || 0,
          maxPOBAltClearanceOptionId: entity.entityId,
        }))
        : [],
      appliedCustomsLocationInformations: this.appliedCustomsLocationInformations
        ? this.appliedCustomsLocationInformations?.map(entity => ({
          id: entity.id || 0,
          customsLocationInformationId: entity.entityId,
        }))
        : [],
      customsClearanceFBOs: this.customsClearanceFBOs
        ? this.customsClearanceFBOs?.map(entity => ({
          id: entity.id || 0,
          clearanceFBOId: entity.entityId,
          clearanceFBOName: entity.name,
          clearanceFBOCode: entity.code,
        }))
        : [],
    };
  }
}
