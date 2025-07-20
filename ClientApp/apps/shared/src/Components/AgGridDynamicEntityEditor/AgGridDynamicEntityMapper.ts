export const entityMapper = {
  MilitaryAirport: 'airport',
  AirportOfEntry_AOE: 'airportofentry',
};

export const useDynamicEntityMapper = () => {
  // Normalize keys to lowercase when initializing the Map
  const dynamicEntities = new Map<string, string>(
    Object.entries(entityMapper).map(([ key, value ]) => [ key.toLowerCase(), value ])
  );

  // Custom getter function to retrieve values case-insensitively
  const getEntity = (key: string): string | undefined => {
    return dynamicEntities.get(key.toLowerCase());
  };

  return {
    get: getEntity,
    entries: dynamicEntities.entries(),
    has: (key: string) => dynamicEntities.has(key.toLowerCase()),
    keys: dynamicEntities.keys(),
    values: dynamicEntities.values(),
    rawMap: dynamicEntities,
  };
};
