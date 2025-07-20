export enum FAA_IMPORT_COMPARISON_FILTERS {
  SOURCE_LOCATION_ID = 'Source Location ID',
  ICAO = 'ICAO',
  AIRPORT_NAME = 'Airport Name',
  CITY_NAME = 'City Name',
  STATE_NAME = 'State Name',
  RUNWAY_ID = 'Runway Id',
  FAA_MERGE_STATUS = 'FAA Merge Status',
}

export enum FAA_IMPORT_DATA_FILTERS {
  ALL = 'All',
  ADDED = 'Added',
  MODIFIED = 'Modified',
  REMOVED = 'Removed',
}

export enum FAA_IMPORT_STAGING_ENTITY_TYPE {
  AIRPORT = 1,
  RUNWAYS = 2,
  FREQUENCY = 3,
}

export enum FAA_IMPORT_EDITABLE_PROPERTIES {
  CITY = 'city',
  STATE = 'state',
  COUNTRY = 'country',
  ICAO = 'icao',
}

export enum FAA_IMPORT_EDITABLE_SETTINGS {
  AIRPORT_FACILITY_TYPE = 'AirportFacilityType',
  AIRPORT_FACILITY_ACCESS_LEVEL = 'AirportFacilityAccessLevel',
  AIRPORT_DATA_SOURCE = 'AirportDataSource',
  APPLIED_AIRPORT_TYPE = 'AppliedAirportType',
  APPLIED_AIRPORT_USAGE_TYPE = 'AppliedAirportUsageType',
  MILITARY_USE_TYPE = 'MilitaryUseType',
  AIRPORT_OF_ENTRY = 'AirportOfEntry',
  DISTANCE_UOM = 'DistanceUOM',
  ELEVATION_UOM = 'ElevationUOM',
  AIRPORT_DIRECTION = 'AirportDirection',
  ACCESS_LEVEL = 'AccessLevel',
  SOURCE_TYPE = 'SourceType',

  // Operational Information settings options
  AIRPORT_CATEGORY = 'AirportCategory',
  WEATHER_REPORTING_SYSTEM = 'WeatherReportingSystem',

  //Runway
  RUNWAY_LIGHT_TYPE_ID= 'RunwayLightTypeId',
  RUNWAY_CONDITION_ID='RunwayConditionId',
  RUNWAY_SURFACE_TREATMENT_ID= 'RunwaySurfaceTreatmentId',
  RUNWAY_SURFACE_PRIMARY_TYPE_ID='RunwaySurfacePrimaryTypeId',
  RUNWAY_SURFACE_SECONDARY_TYPE_ID='RunwaySurfaceSecondaryTypeId',
  RUNWAY_USAGE_TYPE='RunwayUsageType',
  RUNWAY_RVR_ID= 'RunwayRVRId',
  RUNWAY_APPROACH_LIGHT_ID='RunwayApproachLightId',
  RUNWAY_VGSI_ID='RunwayVGSIId',
  APPLIED_RUNWAY_APPROACH_TYPE='AppliedRunwayApproachType',
  APPLIED_RUNWAY_NAVAIDS='AppliedRunwayNavaids',
  TOUCHDOWN_LIGHTS='TouchdownLights',
  CENTERLINE_LIGHTS='CenterlineLights',
  RVV='RVV',
  REIL='REIL',
}
