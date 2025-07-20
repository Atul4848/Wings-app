import { MapType } from './Enums';
import { IMapOptions, IMarker } from './Interfaces';
import {
  EnvironmentVarsStore,
  ENVIRONMENT_VARS,
} from '@wings-shared/env-store';

class MapBoxStore {
  private readonly env = new EnvironmentVarsStore();
  private readonly accessToken: string = this.env.getVar(
    ENVIRONMENT_VARS.MAPBOX_API_TOKEN
  );
  private window: any;
  private mapContainer: HTMLElement;
  private map: any = null;

  constructor(container: HTMLElement, window: Window) {
    this.mapContainer = container;
    this.window = window;
  }

  private getMapType(maptype: MapType): string {
    switch (maptype) {
      case MapType.SATELLITE:
        return 'mapbox/satellite-v9';
      case MapType.HYBRID:
        return 'mapbox/satellite-streets-v10';
      case MapType.STANDARD:
        return 'mapbox/streets-v11';
      case MapType.BASEMAP1:
        return 'astagner/ckah6zdkk01lu1ila1qiei2v0';
      case MapType.BASEMAP2:
        return 'astagner/ckah7c5r801y01inx1ztsjllh';
    }
  }

  /* istanbul ignore next */
  // Add Marker to location
  public addMarker(marker: IMarker): void {
    if (!marker) {
      return;
    }
    const _marker: IMarker = new this.window.L.marker(
      new this.window.L.LatLng(marker.latitude, marker.longitude),
      {
        title: marker.title,
      }
    ).bindPopup(marker.title);

    _marker.addTo(this.map);
    this.map.setView(_marker.getLatLng(), 13);
  }

  // options for map settings
  private getMapOption(options: IMapOptions): IMapOptions {
    const defaultOptions = {
      center: [40.1117, -99.2285],
      mapTypeId: this.getMapType(MapType.SATELLITE),
      zoom: 4,
      minZoom: 4,
      maxZoom: 16,
      zoomControlPosition: 'bottomright',
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
    };

    return {
      ...defaultOptions,
      ...options,
      center: Array.isArray(options.center)
        ? options.center
        : [40.1117, -99.2285],
      mapTypeId: options.mapTypeId || this.getMapType(MapType.STANDARD),
    };
  }

  /* istanbul ignore next */
  // initilize map box and it's dependicies
  public initMap(options: any = {}): void {
    this.mapContainer.innerHTML =
      '<div id="map" style="width: 100%; height: 100%;"></div>';
    this.map = this.window.L.map('map', this.getMapOption(options));
    this.map.zoomControl.setPosition('bottomright');

    this.window.L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        zIndex: 0,
        accessToken: this.accessToken,
      }
    ).addTo(this.map);
  }
}

export default MapBoxStore;
