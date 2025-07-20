import { StateModel } from '@wings/shared';
import { expect } from 'chai';
import { EventStore } from '../Stores';

describe('Event Store', () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore();
  });

  it('called getCityFilters method without states', () => {
    expect(store.getCityFilters([1, 2])).length.to.length(2);
  });

  it('called getCityFilters method with countries and states', () => {
    const states: StateModel[] = [
      new StateModel({ id: 1, countryId: 1 }),
      new StateModel({ id: 2, countryId: 2 }),
      new StateModel({ id: 3, countryId: 2 }),
    ];
    expect(store.getCityFilters([1, 2, 3], states)).length.to.length(4);
  });
});
