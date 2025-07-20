import React, { useRef, useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { IMapOptions, IMarker } from '../Interfaces';
import { MapType } from '../Enums';
import { useStyles } from './MapBoxViewV1.styles';

// Initialize Mapbox
interface Props {
  onMarkerDragEnd: (letlng: any) => void;
  marker: IMarker;
  value: any[];
}
const MapBoxViewV1: FC<Props> = observer(({ onMarkerDragEnd, marker, value }) => {
  const classes = useStyles();
  const env = new EnvironmentVarsStore();
  const accessToken: string = env.getVar(ENVIRONMENT_VARS.MAPBOX_API_TOKEN);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [ _marker, setMarker ] = useState({ latitude: value[1], longitude: value[0], title: '' });
  const [ lngLat, setLngLat ] = useState(value);
  const mywindow:any = window;

  let map: any = null;

  useEffect(() => {
    initMap();
    addMarker(marker);
  }, [ onMarkerDragEnd ]);

  // Add Marker to location

  const addMarker = (marker1: IMarker): void => {
    if (marker1) {
      setMarker(marker1);
      return;
    }

    const marker = new mywindow.L.marker(new mywindow.L.LatLng(_marker?.latitude, _marker?.longitude), {
      title: _marker?.title,
      draggable: true,
    });

    setMarker(marker);

    marker.addTo(map);

    map.setView(marker.getLatLng(), 6);

    marker.on('dragend', () => {
      const { lng, lat } = marker._latlng;
      setLngLat([ lng, lat ]);
      onMarkerDragEnd({ lng, lat });
      updateCoordinates(lat,lng);
    });
  };

  const getMapType = (maptype: MapType): string => {
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
  };

  // options for map settings
  const getMapOption = (options: IMapOptions): IMapOptions => {
    const defaultOptions = {
      center: lngLat,
      mapTypeId: getMapType(MapType.SATELLITE),
      zoom: 2,
      minZoom: 2,
      maxZoom: 16,
      zoomControlPosition: 'bottomright',
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
    };

    return {
      ...defaultOptions,
      // ...options,
      center: Array.isArray(options.center) ? options.center : [ lngLat[0], lngLat[1] ],
      mapTypeId: options.mapTypeId || getMapType(MapType.STANDARD),
    };
  };

  const initMap = (options: any = {}): void => {
    const container = mapContainer.current || new HTMLDivElement();
    container.innerHTML =
      `<div id="map" style="width: 100%; height: 100%; position: relative;"> 
        <div id="search-box" style="position: absolute; top: 10px; left: 10px; z-index: 1000;"> 
          <input type="text" placeholder="Search for a location" id="search-input" />
          <div id="search-results" style="margin-top: 10px;"></div>
        </div>
        <div style="position: absolute;bottom: 20px; left: 10px; z-index: 1000;background-color:rgb(35 55 75 / 90%);color: #fff;padding: 6px 12px; border-radius: 4px;">Longitude: <span id="longitude"></span><br />  Latitude: <span id="latitude"></span> 
        </div>
      </div>`;
    map = mywindow.L.map('map', getMapOption(options));
    map.zoomControl.setPosition('bottomright');

    mywindow.L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      zIndex: 0,
      accessToken: accessToken,
    }).addTo(map);

    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const searchResultsContainer = document.getElementById('search-results')|| new HTMLElement();
    const latitudeElement = document.getElementById('latitude') || new HTMLElement();
    const longitudeElement = document.getElementById('longitude') || new HTMLElement();

    searchInput.addEventListener('input', event => {
      const searchQuery = (event.target as HTMLInputElement).value;
      if (searchQuery) {
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${accessToken}`)
          .then(response => response.json())
          .then(data => {
            renderSearchResults(data.features);
          })
          .catch(error => console.error('Error fetching data:', error));
      } else {
        searchResultsContainer.innerHTML = ''; // Clear search results container
      }
    });

    // Function to render search results
    const renderSearchResults = (results: any[]) => {
      searchResultsContainer.innerHTML = ''; // Clear previous search results
      results.forEach((result) => {
        const div = document.createElement('div');
        div.textContent = result.text;
        div.addEventListener('click', () => handleSearchSelect(result));
        searchResultsContainer.appendChild(div);
      });
    };

    const updateSidebar = (latitude: number, longitude: number) => {
      latitudeElement.textContent = latitude.toFixed(6);
      longitudeElement.textContent = longitude.toFixed(6);
    };

    updateSidebar(lngLat[1], lngLat[0]);

    map.on('move', () => {
      
      // updateSidebar(center.lat, center.lng);
    });
  };

  const handleSearchSelect = (selectedResult: any) => {
    const { center } = selectedResult;
    setLngLat(center);
    initMap();
    if (marker) {
      map.removeLayer(marker);
    }
    const newMarker = new mywindow.L.marker([ center[1], center[0] ], {
      title: _marker?.title,
      draggable: true,
    }).addTo(map);
    if (map) {
      newMarker.addTo(map);
      const { lng, lat } = newMarker._latlng;
      setLngLat([ lng, lat ]);
      onMarkerDragEnd({ lng, lat });
      updateCoordinates(lat,lng);
      map.setView([ center[1], center[0] ], 6);
      newMarker.on('dragend', () => {
        const { lng, lat } = newMarker._latlng;
        setLngLat([ lng, lat ]);
        onMarkerDragEnd({ lng, lat });
        updateCoordinates(lat,lng);
      });
    } else {
      console.error('Map is not initialized yet.');
    }
    setMarker(newMarker);
  };

  const updateCoordinates = (lat:any, lng:any) => {
    const latitudeElement = document.getElementById('latitude') || new HTMLElement();
    const longitudeElement = document.getElementById('longitude') || new HTMLElement();
    latitudeElement.textContent = lat.toFixed(6);
    longitudeElement.textContent = lng.toFixed(6);
  };
  return (
    <div className={classes.mapBoxViewWrapper}>
      <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
    </div>
  );
});
export default MapBoxViewV1;
