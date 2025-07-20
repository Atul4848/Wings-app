import {
  AirportLogisticsStore,
} from './AirportLogistics.store';

class RootStore {
  public airportLogisticsStore: AirportLogisticsStore;

  constructor() {
    this.airportLogisticsStore = new AirportLogisticsStore();
  }

  public reset(): void {
    this.airportLogisticsStore.reset();
  }
}

const rootStore = new RootStore();

export default rootStore;
