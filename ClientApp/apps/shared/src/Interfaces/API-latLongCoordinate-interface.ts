export interface IAPILatLongCoordinate {
  latitude: number;
  longitude: number;
  coordinate?: IAPICoordinate;
}

export interface IAPICoordinate {
  direction: string;
  degree: string;
  minutes: string;
  seconds: string;
}
