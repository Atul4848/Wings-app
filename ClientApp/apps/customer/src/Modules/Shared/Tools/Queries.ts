import { INoSqlAPIRequest } from '../Interfaces';

/* istanbul ignore next */
// Generate Query for /gql endpoint
export const getGqlQuery = (request: INoSqlAPIRequest) => {
  const skipTake = `skip: ${request.pageSize * (request.pageNumber - 1)},take: ${request.pageSize}`;
  const where = request.gqlQuery ? `where: ${request.gqlQuery}` : '';
  return `query Search {customer(${where} ${skipTake}){items {name,number,accessLevel{accessLevelId,name},sourceType{sourceTypeId,name},status{statusId,name},createdBy,createdOn,modifiedBy,modifiedOn} totalCount}}`;
};
