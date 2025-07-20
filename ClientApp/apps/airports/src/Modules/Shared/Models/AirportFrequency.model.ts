import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirportFrequency, IAPIAirportRunway } from '../Interfaces';
import { AssociatedRunwayModel } from './AssociatedRunways.model';
import { AirportRunwayModel } from './AirportRunway.model';

@modelProtection
export class AirportFrequencyModel extends CoreModel {
  airportId: number;
  frequency: string;
  phone: number;
  sector: SettingsTypeModel;
  frequencyType: SettingsTypeModel;
  airportFrequencyRunways: AssociatedRunwayModel[];
  comments: string;
  faaComments: string;

  constructor(data?: Partial<AirportFrequencyModel>) {
    super(data);
    Object.assign(this, data);
    this.sector = data?.sector ? new SettingsTypeModel(data?.sector) : null;
    this.frequencyType = data?.frequencyType ? new SettingsTypeModel(data?.frequencyType) : null;
    this.airportFrequencyRunways = data?.airportFrequencyRunways?.map(x => new AssociatedRunwayModel(x)) || [];
  }

  static deserialize(apiData: IAPIAirportFrequency, runways: AirportRunwayModel[] = []): AirportFrequencyModel {
    if (!apiData) {
      return new AirportFrequencyModel();
    }
    const data: Partial<AirportFrequencyModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportFrequencyId || apiData.id,
      airportId: apiData.airportId,
      sector: new SettingsTypeModel({
        ...apiData.sector,
        id: apiData.sector?.sectorId || apiData.sector?.id,
      }),
      frequencyType: new SettingsTypeModel({
        ...apiData.frequencyType,
        id: apiData.frequencyType?.frequencyTypeId || apiData.frequencyType?.id,
      }),
      airportFrequencyRunways: apiData?.airportFrequencyRunways?.map(_runway => {
        const runway = runways.find(y => y.id === _runway.runwayId);
        const runwayDetail = runway?.getRunwayDetails.find(x => x.id === _runway.runwayDetailId) as any;
        return new AssociatedRunwayModel({
          ..._runway,
          airportFrequencyId: apiData.airportFrequencyId || apiData.id,
          runway,
          runwayDetail,
        });
      }),
    };
    return new AirportFrequencyModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportFrequency {
    return {
      id: this.id,
      airportId: this.airportId,
      frequency: this.frequency || '',
      phone: this.phone,
      sectorId: this.sector?.id,
      frequencyTypeId: this.frequencyType?.id,
      comments: this.comments,
      faaComments: this.faaComments,
    };
  }

  static deserializeList(apiData: IAPIAirportFrequency[], runways: IAPIAirportRunway[] = []): AirportFrequencyModel[] {
    return apiData ? apiData.map(data => AirportFrequencyModel.deserialize(data, runways)) : [];
  }
}
