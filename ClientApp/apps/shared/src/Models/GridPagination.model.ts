import { IAPIPageResponse } from '@wings-shared/core';

export class GridPagination {
  pageNumber: number;
  pageSize: number;
  totalNumberOfRecords: number;

  constructor(data?: Partial<IAPIPageResponse>) {
    this.pageNumber = data?.pageNumber || 1;
    this.pageSize = data?.pageSize || 30;
    this.totalNumberOfRecords = data?.totalNumberOfRecords || 0;
  }
}
