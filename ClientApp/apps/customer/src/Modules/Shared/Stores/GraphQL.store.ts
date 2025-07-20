import { camelCase } from 'change-case';
import { action } from 'mobx';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomerModel } from '../Models';
import { HttpClient, baseApiPath } from '@wings/shared';
import { INoSqlAPIRequest } from '../Interfaces';
import { getGqlQuery } from '../Tools';

class GraphQLStore {
  /* istanbul ignore next */
  @action
  public loadGqlData(request: INoSqlAPIRequest): Observable<any> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    return from(
      http.post<any>('/graphql', { query: getGqlQuery(request) })
    ).pipe(
      map(resp => {
        const collection = resp.data[camelCase('customer')];
        return {
          pageNumber: request.pageNumber,
          pageSize: request.pageSize,
          totalNumberOfRecords: collection?.totalCount,
          results: CustomerModel.deserializeList(collection?.items) || [],
        };
      })
    );
  }
}

const graphQLStore = new GraphQLStore();
export default graphQLStore;
