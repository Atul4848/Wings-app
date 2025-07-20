import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Logger } from '@wings-shared/security';
import { HttpClient, NO_SQL_COLLECTIONS, SettingsBaseStore, baseApiPath } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { AssociatedOperatorsModel, OperatorModel } from '../Models';
import { IAPIAssociatedOperators, IAPIOperator } from '../Interfaces';
import { apiUrls } from './API.url';

export class OperatorStore extends SettingsBaseStore {
  @observable public operators: OperatorModel[] = [];
  @observable public operatorList: OperatorModel[] = [];
  @observable public associatedOperators: AssociatedOperatorsModel[] = [];
  @observable public selectedOperator: OperatorModel = new OperatorModel();

  constructor(baseUrl?: string) {
    super(baseUrl || '');
  }

  /* istanbul ignore next */
  public getOperatorsNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<OperatorModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      collectionName: NO_SQL_COLLECTIONS.OPERATOR,
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIOperator>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: OperatorModel.deserializeList(response.results) }))
    );
  }

  /* istanbul ignore next */
  public getOperators(): Observable<OperatorModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
    });
    return http.get<IAPIPageResponse<IAPIOperator>>(`${apiUrls.operator}?${params}`).pipe(
      Logger.observableCatchError,
      map(response =>
        Utilities.customArraySort<OperatorModel>(OperatorModel.deserializeList(response.results), 'name')
      ),
      tap(response => (this.operatorList = response))
    );
  }

  /* istanbul ignore next */
  public upsertOperator(operator: OperatorModel): Observable<OperatorModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddOperator: boolean = operator.id === 0;
    const upsertRequest: Observable<IAPIOperator> = isAddOperator
      ? http.post<IAPIOperator>(apiUrls.operator, operator.serialize())
      : http.put<IAPIOperator>(`${apiUrls.operator}/${operator.id}`, operator.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIOperator) => OperatorModel.deserialize(response)),
      tapWithAction((operator: OperatorModel) => {
        this.operators = Utilities.updateArray<OperatorModel>(this.operators, operator, {
          replace: !isAddOperator,
          predicate: t => t.id === operator.id,
        });
        return AlertStore.info(`Operator ${isAddOperator ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getOperatorById(operatorId: number): Observable<OperatorModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http
      .get<IAPIOperator>(`${apiUrls.operator}/${operatorId}`)
      .pipe(map(response => OperatorModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public getAssociatedOperators(
    customerNumber: string,
    request?: IAPIGridRequest
  ): Observable<AssociatedOperatorsModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      customerNumber,
      pageNumber: 1,
      pageSize: 0,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIAssociatedOperators>>(`${customerNumber}/${apiUrls.associatedOperator}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => AssociatedOperatorsModel.deserializeList(response.results)),
        tapWithAction(resp => (this.associatedOperators = resp))
      );
  }

  /* istanbul ignore next */
  public upsertAssociatedOperator(
    associatedOperator: AssociatedOperatorsModel,
    partyId: number
  ): Observable<AssociatedOperatorsModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddAssociatedOperator: boolean = associatedOperator.id === 0;
    const upsertRequest: Observable<IAPIAssociatedOperators> = isAddAssociatedOperator
      ? http.post<IAPIAssociatedOperators>(
        `${associatedOperator.customer.number}/${apiUrls.associatedOperator}`,
        associatedOperator.serialize(partyId)
      )
      : http.put<IAPIAssociatedOperators>(
        `${associatedOperator.customer.number}/${apiUrls.associatedOperator}`,
        associatedOperator.serialize(partyId)
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedOperators) => AssociatedOperatorsModel.deserialize(response)),
      tapWithAction((associatedOperator: AssociatedOperatorsModel) => {
        this.associatedOperators = Utilities.updateArray<AssociatedOperatorsModel>(
          this.associatedOperators,
          associatedOperator,
          {
            replace: !isAddAssociatedOperator,
            predicate: t => t.id === associatedOperator.id,
          }
        );
        return AlertStore.info(`Associated Operator ${isAddAssociatedOperator ? 'created' : 'updated'} successfully!`);
      })
    );
  }
}
