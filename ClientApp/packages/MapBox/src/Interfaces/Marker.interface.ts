export interface IMarker extends ILatLong {
  title: string;
  icon: string;
  getLatLng: () => number[];
  addTo: (marker: IMarker) => void;
}

export interface ILatLong {
  latitude: number;
  longitude: number;
}
