export interface IAPIGridRequest {
  pageNumber?: number;
  pageSize?: number;
  filterCollection?: string | null;
  searchCollection?: string | null;
  sortCollection?: string;
  specifiedFields?: string[];
  queryFilter?: string;
  query?: string;
  q?: string;
  status?: string;
  provider?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
}
