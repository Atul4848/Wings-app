import { EntityOptionsStore } from '@wings/shared';
import {
  TimeZoneStore,
  TimeZoneDetailStore,
  TimeZoneReviewStore,
  EventStore,
  TimeZoneSettingsStore,
  AirportTimeZoneMappingStore,
} from './index';

class TimeZoneRoot {
  public timeZoneStore: TimeZoneStore = new TimeZoneStore();
  public timeZoneDetailStore: TimeZoneDetailStore = new TimeZoneDetailStore();
  public timeZoneReviewStore: TimeZoneReviewStore = new TimeZoneReviewStore();
  public airportTimeZoneMappingStore: AirportTimeZoneMappingStore = new AirportTimeZoneMappingStore();
  public eventStore: EventStore = new EventStore();
  public timeZoneSettingsStore: TimeZoneSettingsStore = new TimeZoneSettingsStore();
  public entityOptionsStore: EntityOptionsStore = new EntityOptionsStore();
}

const timeZoneRoot = new TimeZoneRoot();

export default timeZoneRoot;
