import { IAPILatLongCoordinate } from '../Interfaces';
import { CoordinateModel } from './index';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class LatLongCoordinateModel {
  latitude: number = null;
  longitude: number = null;
  coordinate: CoordinateModel;

  constructor(data?: Partial<LatLongCoordinateModel>) {
    Object.assign(this, data);
    this.coordinate = data?.coordinate ? new CoordinateModel(data?.coordinate) : null;
  }

  static deserialize(apiData: IAPILatLongCoordinate): LatLongCoordinateModel {
    if (!apiData) {
      return new LatLongCoordinateModel();
    }
    const data: Partial<LatLongCoordinateModel> = {
      latitude: apiData.latitude,
      longitude: apiData.longitude,
      coordinate: CoordinateModel.deserialize({ ...apiData.coordinate }),
    };
    return new LatLongCoordinateModel(data);
  }
}
