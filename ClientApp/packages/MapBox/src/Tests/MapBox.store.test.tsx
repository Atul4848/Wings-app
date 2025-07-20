import MapBoxStore from '../MapBox.store';
import { MapType } from '../Enums';
import { expect } from 'chai';

describe('MapBoxStore', () => {

  describe('getMapType', () => {
    it('should return the correct Mapbox style URL for SATELLITE', () => {
      const mapType = MapType.SATELLITE;
      const mapBoxStore = new MapBoxStore(document.createElement('div'), {});
      const result = mapBoxStore.getMapType(mapType);
      expect(result).to.equal('mapbox/satellite-v9');
    });

    it('should return the correct Mapbox style URL for HYBRID', () => {
      const mapType = MapType.HYBRID;
      const mapBoxStore = new MapBoxStore(document.createElement('div'), {});
      const result = mapBoxStore.getMapType(mapType);
      expect(result).to.equal('mapbox/satellite-streets-v10');
    });

    it('should return the correct Mapbox style URL for STANDARD', () => {
      const mapType = MapType.STANDARD;
      const mapBoxStore = new MapBoxStore(document.createElement('div'), {});
      const result = mapBoxStore.getMapType(mapType);
      expect(result).to.equal('mapbox/streets-v11');
    });

    it('should return the correct Mapbox style URL for BASEMAP1', () => {
      const mapType = MapType.BASEMAP1;
      const mapBoxStore = new MapBoxStore(document.createElement('div'), {});
      const result = mapBoxStore.getMapType(mapType);
      expect(result).to.equal('astagner/ckah6zdkk01lu1ila1qiei2v0');
    });

    it('should return the correct Mapbox style URL for BASEMAP2', () => {
      const mapType = MapType.BASEMAP2;
      const mapBoxStore = new MapBoxStore(document.createElement('div'), {});
      const result = mapBoxStore.getMapType(mapType);
      expect(result).to.equal('astagner/ckah7c5r801y01inx1ztsjllh');
    })
})
});
