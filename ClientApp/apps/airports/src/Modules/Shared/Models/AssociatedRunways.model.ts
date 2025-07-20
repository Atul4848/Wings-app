import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIFrequencyRunway } from '../Interfaces';
import { RunwayDetailModel } from './RunwayDetail.model';
import { AirportRunwayModel } from './AirportRunway.model';

@modelProtection
export class AssociatedRunwayModel extends CoreModel {
  airportFrequencyId: number;
  runwayDetail: RunwayDetailModel;
  runway: AirportRunwayModel;

  constructor(data?: Partial<AssociatedRunwayModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIFrequencyRunway): AssociatedRunwayModel {
    if (!apiData) {
      return new AssociatedRunwayModel();
    }
    const data: Partial<AssociatedRunwayModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AssociatedRunwayModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIFrequencyRunway {
    return {
      ...this._serialize(),
      id: this.id,
      airportFrequencyId: this.airportFrequencyId,
      runwayDetailId: this.runwayDetail.id,
      sourceTypeId: 1,
    };
  }

  static deserializeList(apiData: IAPIFrequencyRunway[]): AssociatedRunwayModel[] {
    return apiData ? apiData.map((data: IAPIFrequencyRunway) => AssociatedRunwayModel.deserialize(data)) : [];
  }
}
