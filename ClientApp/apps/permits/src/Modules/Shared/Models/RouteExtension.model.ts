import { modelProtection, CoreModel } from '@wings-shared/core';
import { IAPIRouteAirwayExtension } from '../Interfaces';

@modelProtection
export class RouteExtensionModel extends CoreModel {
  originWaypoint: string = '';
  airway: string = '';
  destinationWaypoint: string = '';
  permitId: number;

  constructor(data?: Partial<RouteExtensionModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRouteAirwayExtension): RouteExtensionModel {
    if (!apiData) {
      return new RouteExtensionModel();
    }
    const data: Partial<RouteExtensionModel> = {
      originWaypoint: apiData.wayPoint1,
      airway: apiData.airway,
      destinationWaypoint: apiData.wayPoint2,
      id: apiData.permitRouteAirwayExtensionId,
      permitId: apiData.permitId,
    };
    return new RouteExtensionModel(data);
  }

  static deserializeList(apiDataList?: IAPIRouteAirwayExtension[]): RouteExtensionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRouteAirwayExtension) => RouteExtensionModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIRouteAirwayExtension {
    return {
      permitRouteAirwayExtensionId: this.id,
      wayPoint1: this.originWaypoint,
      airway: this.airway,
      wayPoint2: this.destinationWaypoint,
      permitId: this.permitId,
    };
  }
}
