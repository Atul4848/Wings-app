import { Direction } from 'dms-conversion';
export interface IDMSCordinates {
  longitude: IDMSCoordsValue;
  latitude: IDMSCoordsValue;
}
export type IDMSCoordsValue = [number, number, number, Direction];
