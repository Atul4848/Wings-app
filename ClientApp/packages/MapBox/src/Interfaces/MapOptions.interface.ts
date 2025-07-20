export interface IMapOptions {
  center: number[]; // Lat long values
  mapTypeId: string;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControlPosition?: string;
  style: string; // style URL 'mapbox://styles/mapbox/streets-v11',
}


