import { CoreModel, EntityMapModel, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirportSecurity, IAPIAirportSecurityRequest, SelectType } from '../Interfaces';

export class AirportSecurityModel extends CoreModel {
  airportId: number;
  rampSideAccessNonOpsDuringStay: string = '';
  securityNotes: string = '';
  rampSideAccess: SettingsTypeModel;
  rampSideAccess3rdParty: SettingsTypeModel;
  airportFencing: SelectType = null;
  airportPolice: SelectType = null;
  crewScreening: SelectType = null;
  passengerScreening: SelectType = null;
  baggageScreening: SelectType = null;
  securityPatrols: SelectType = null;
  privateSecurityAllowed: SelectType = null;
  securityOrCompanyIdRqrdForCrew: SelectType = null;
  uniformRequiredForCrew: SelectType = null;
  airportSecurityViaAirportAuthorityOnly: SelectType = null;
  airportSecurity24Hours: SelectType = null;
  rampSideAccess3rdPartyVendors: EntityMapModel[] = [];
  parkingAreaSecurityMeasures: EntityMapModel[] = [];
  gaParkingSecurityMeasures: EntityMapModel[] = [];
  airportSecurityMeasures: EntityMapModel[] = [];
  recommendedSecurityServices: EntityMapModel[] = [];

  constructor(data?: Partial<AirportSecurityModel>) {
    super(data);
    Object.assign(this, data);
  }

  public static deserialize(apiData: IAPIAirportSecurity): AirportSecurityModel {
    if (!apiData) {
      return new AirportSecurityModel();
    }
    const data: Partial<AirportSecurityModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportSecurityId || apiData.id,
      rampSideAccess: new SettingsTypeModel({
        ...apiData.rampSideAccess,
        id: apiData.rampSideAccess?.rampSideAccessId || apiData.rampSideAccess?.id,
      }),
      rampSideAccess3rdParty: new SettingsTypeModel({
        ...apiData.rampSideAccess3rdParty,
        id: apiData.rampSideAccess3rdParty?.rampSideAccess3rdPartyId || apiData.rampSideAccess3rdParty?.id,
      }),
      rampSideAccess3rdPartyVendors: apiData.appliedRampSideAccess3rdPartyVendors?.map(
        x =>
          new EntityMapModel({
            id: x.appliedRampSideAccess3rdPartyVendorId || x.id,
            entityId: x.rampSideAccess3rdPartyVendor?.rampSideAccess3rdPartyVendorId,
            name: x.rampSideAccess3rdPartyVendor?.name,
          })
      ),
      parkingAreaSecurityMeasures: apiData.appliedParkingAreaSecurityMeasures?.map(
        x =>
          new EntityMapModel({
            id: x.appliedParkingAreaSecurityMeasureId || x.id,
            entityId: x.parkingAreaSecurityMeasure?.parkingAreaSecurityMeasureId,
            name: x.parkingAreaSecurityMeasure?.name,
          })
      ),
      gaParkingSecurityMeasures: apiData.appliedGAParkingSecurityMeasures?.map(
        x =>
          new EntityMapModel({
            id: x.appliedGAParkingSecurityMeasureId || x.id,
            entityId: x.gaParkingSecurityMeasure?.gaParkingSecurityMeasureId,
            name: x.gaParkingSecurityMeasure?.name,
          })
      ),
      airportSecurityMeasures: apiData.appliedAirportSecurityMeasures?.map(
        x =>
          new EntityMapModel({
            id: x.appliedAirportSecurityMeasureId || x.id,
            entityId: x.airportSecurityMeasure?.airportSecurityMeasureId,
            name: x.airportSecurityMeasure?.name,
          })
      ),
      recommendedSecurityServices: apiData.appliedRecommendedSecurityServices?.map(
        x =>
          new EntityMapModel({
            id: x.appliedRecommendedSecurityServiceId || x.id,
            entityId: x.recommendedService?.recommendedServiceId,
            name: x.recommendedService?.name,
          })
      ),
    };
    return new AirportSecurityModel(data);
  }

  public serialize(): IAPIAirportSecurityRequest {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      rampSideAccessNonOpsDuringStay: this.rampSideAccessNonOpsDuringStay,
      securityNotes: this.securityNotes,
      rampSideAccessId: this.rampSideAccess?.id || null,
      rampSideAccess3rdPartyId: this.rampSideAccess3rdParty?.id || null,
      airportFencing: this.airportFencing,
      airportPolice: this.airportPolice,
      crewScreening: this.crewScreening,
      passengerScreening: this.passengerScreening,
      baggageScreening: this.baggageScreening,
      securityPatrols: this.securityPatrols,
      privateSecurityAllowed: this.privateSecurityAllowed,
      securityOrCompanyIdRqrdForCrew: this.securityOrCompanyIdRqrdForCrew,
      uniformRequiredForCrew: this.uniformRequiredForCrew,
      airportSecurityViaAirportAuthorityOnly: this.airportSecurityViaAirportAuthorityOnly,
      airportSecurity24Hours: this.airportSecurity24Hours,
      appliedRampSideAccess3rdPartyVendors: this.rampSideAccess3rdPartyVendors.map(x => {
        return { id: x.id, rampSideAccess3rdPartyVendorId: x.entityId };
      }),
      appliedParkingAreaSecurityMeasures: this.parkingAreaSecurityMeasures.map(x => {
        return { id: x.id, parkingAreaSecurityMeasureId: x.entityId };
      }),
      appliedGAParkingSecurityMeasures: this.gaParkingSecurityMeasures.map(x => {
        return { id: x.id, gaParkingSecurityMeasureId: x.entityId };
      }),
      appliedAirportSecurityMeasures: this.airportSecurityMeasures.map(x => {
        return { id: x.id, airportSecurityMeasureId: x.entityId };
      }),
      appliedRecommendedSecurityServices: this.recommendedSecurityServices.map(x => {
        return { id: x.id, recommendedServiceId: x.entityId };
      }),
    };
  }
}
