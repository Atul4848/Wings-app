export const apiUrls = {
  locations: 'api/Location',
  timeZone: 'api/TimeZone',
  timeZoneMapping: 'api/CustomAirportTimezoneRegionMapping',
  airports: 'api/Airport',
  timeZonesForLocation: (locationId: number) => `api/Location/${locationId}/timeZones`,
  country: 'api/Country',
  timeZoneRegion: 'api/TimeZoneRegion',
  state: 'api/State',
  city: 'api/City',
  region: 'api/Region',
  timezoneDetails: 'api/TimeZone/TimeZoneDetail',
  airportLocations: '/api/AirportLocation',
  updateAirportTimezone: id => `api/AirportLocation/${id}/UpdateAirportTimezone`,
  addAirportTimezone: 'api/AirportLocation/AddAirportTimezone',
  updateStagingTimezoneRegion: id => `api/StagingAirportRegion/${id}/UpdateTimezoneRegion`,
  updateTimezoneRegion: airportId => `api/AirportLocation/${airportId}/UpdateTimezoneRegion`,
  timezoneRefresh: 'api/dstdatacompare/RefreshTimezones',
  airportTimezones: airportId => `api/Airport/${airportId}/timezones`,
  timezoneApprove: 'api/StagingTimeZone/Approve',
  timezoneReject: 'api/StagingTimeZone/Reject',
  stagingTimezone: 'api/StagingTimeZone',
  timezoneAirports: (timeZoneId: number) => `api/TimeZone/${timeZoneId}/airports`,
  stagingTimezoneAirports: (stagingTimeZoneId: number) => `api/Airport/${stagingTimeZoneId}/airports`,
  auditHistory: (timeZoneId: number) => `api/TimeZone/${timeZoneId}/history`,
  event: 'api/WorldEvent',
  importEvent: 'api/WorldEvent/import',
  eventExcel: 'api/WorldEvent/exportexcel',
  downloadWorldEventTemplate: 'api/WorldEvent/DownloadTemplate',
  importedEvents: 'api/WorldEvent/import',
  worldEventStaging: 'api/WorldEventStaging',
  importedEventsErrors: (runId: string) => `api/WorldEvent/import/${runId}/errors`,
  worldEventCategory: 'api/WorldEventCategory',
  worldEventFrequency: 'api/WorldEventFrequency',
  stagingAirportRegion: 'api/StagingAirportRegion',
  approveStagingAirportRegion: 'api/StagingAirportRegion/Approve',
  rejectStagingAirportRegion: 'api/StagingAirportRegion/Reject',
  worldEventType: 'api/WorldEventType',
  accessLevel: 'api/AccessLevel',
  sourceType: 'api/SourceType',
  referenceData: 'api/referenceData',
  worldAware: 'api/WorldAwareSetting',
  uaOffices: 'api/UAOffice',
  worldEventSpecialConsideration: 'api/WorldEventSpecialConsideration',
  worldEventStagingRegion: 'api/WorldEventStaging',
  hotel: 'api/Hotel',
  supplierType: 'api/SupplierType',
  serviceLevel: 'api/ServiceLevel',
  supplier: 'api/Supplier',
  supplierAirport: 'api/supplier',
};
