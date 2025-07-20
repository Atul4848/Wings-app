export interface IAPIPageResponse<T = any> {
  pageNumber: number;
  pageSize: number;
  totalNumberOfRecords: number;
  results: T[];
}

export interface IAPIPascalResponse<T = any> {
  PageNumber: number;
  PageSize: number;
  TotalNumberOfRecords: number;
  Results: T[];
}
