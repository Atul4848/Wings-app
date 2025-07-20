export enum CONDITION_EDITOR {
  // SelectControl Fields
  ARRIVAL = 'arrival',
  DEPARTURE = 'departure',
  USE_AS_ALTERNATE = 'use as alternate',
  EVENT = 'event',

  // AutoComplete Fields
  FLIGHT_TYPES = 'flight types',
  TRAFFIC = 'traffic',
  TRAFFIC_ARRIVAL_ONLY = 'traffic - arrival only',
  TRAFFIC_DEPARTURE_ONLY = 'traffic - departure only',
  AIRCRAFT_TYPE = 'aircraft type',
  NOISE_CHAPTER_ARRIVAL = 'noise chapter arrival',
  NOISE_CHAPTER = 'noise chapter',
  NOISE_CHAPTER_DEPARTURE = 'noise chapter departure',
  OVERTIME = 'overtime',
  EPN_DB = 'epndb',

  // Integer fields
  DECIBEL = 'decibel',
  WEIGHT = 'weight',
  WEIGHT_MTOW_METRICTONS = 'weight (mtow, metric tons)',
  WEIGHT_MTOW_LBS = 'weight (mtow, lbs)',
  WINGSPAN = 'wingspan',
  SEATING_CONFIGURATION = 'seating configuration',
  PAX_SEAT_CAPACITY = 'pax seat capacity',
  CREW_SEAT_CAPACITY = 'crew seat capacity',
  TOTAL_SEAT_CAPACITY = 'total seat capacity',
}
