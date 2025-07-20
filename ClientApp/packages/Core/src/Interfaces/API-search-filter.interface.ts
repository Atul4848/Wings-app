export interface IAPISearchFilter {
  propertyName: string;
  operator?: 'and' | 'or';
  propertyValue?: string | number | string[] | number[] | null;
  filterType?: 'eq' | 'ne' | 'in';
  searchType?: string;
  isArray?: boolean;
}

export interface ISearchEntity {
  searchFilters: IAPISearchFilter[];
  specifiedFields?: string[]; // Provide Specific fields for API i.e Name,ICAO,IATA
}

export interface IAPISearchFiltersDictionary {
  [key: string]: ISearchEntity;
}
