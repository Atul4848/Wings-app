import React, { FC, useEffect, useRef } from 'react';
import { IMarker } from './Interfaces';
import MapBoxStore from './MapBox.store';

interface Props {
  zoom?: number;
  marker: IMarker;
}

const MapBoxView: FC<Props> = ({ marker }) => {
  const mapRef = useRef<any>();

  // needs to use this to prevent multi instances on the mapBox
  const initMap = () => {
    const mapInstance = new MapBoxStore(mapRef.current, window);
    mapInstance.initMap();
    mapInstance.addMarker(marker);
  };

  useEffect(() => initMap(), []);

  return <div style={{ height: '50vh' }} ref={mapRef} />;
};

MapBoxView.defaultProps = {
  zoom: 8,
};
export default MapBoxView;
