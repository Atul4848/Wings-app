export interface IAPIGridRequest {
  pageNumber?: number;
  pageSize?: number;
  filterCollection?: string;
  searchCollection?: string;
  sortCollection?: string;
  specifiedFields?: string[];
  queryFilter?: string;
  query?: string;
  q?: string;
  status?: string;
  provider?: string;
  predicate?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
}
