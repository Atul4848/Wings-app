export interface INoSqlAPIRequest {
  pageNumber?: number;
  pageSize?: number;
  collectionName?: string;
  queryFilter?: string;
  projections?: string;
  sortExpression?: string;
  version?: string;
  // Gql Related Fields
  gqlQuery?: string;
}
